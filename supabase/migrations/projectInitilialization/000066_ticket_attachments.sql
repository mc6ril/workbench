-- Migration: ticket_attachments table + ticket-attachments Storage bucket
--
-- Stores file attachment metadata for tickets. The file itself lives in the
-- "ticket-attachments" Storage bucket; this table holds the path + metadata
-- so files can be deleted from Storage when a row is removed.
--
-- project_id is denormalised (mirroring ticket_assignees) so Supabase Realtime
-- subscriptions can be filtered by project_id=eq.{projectId} on INSERT.
-- A BEFORE INSERT trigger syncs project_id from tickets.project_id.
-- ON DELETE CASCADE on ticket_id cleans up metadata when the parent ticket is deleted.

-- ============================================================================
-- STEP 1: Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid        NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path text       NOT NULL,
  file_name   text        NOT NULL,
  file_size   integer     NOT NULL CHECK (file_size > 0),
  mime_type   text        NOT NULL,
  uploaded_by uuid        REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 2: Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id
  ON public.ticket_attachments (ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_project_id
  ON public.ticket_attachments (project_id);

-- ============================================================================
-- STEP 3: Trigger — sync project_id from tickets (same pattern as comments)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_ticket_attachment_project_id_from_ticket()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.project_id := (
    SELECT t.project_id
    FROM public.tickets t
    WHERE t.id = NEW.ticket_id
  );

  IF NEW.project_id IS NULL THEN
    RAISE EXCEPTION 'Ticket % not found for ticket_attachments sync', NEW.ticket_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_ticket_attachments_project_id ON public.ticket_attachments;
CREATE TRIGGER trg_sync_ticket_attachments_project_id
  BEFORE INSERT OR UPDATE OF ticket_id ON public.ticket_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_ticket_attachment_project_id_from_ticket();

-- ============================================================================
-- STEP 4: RLS
-- ============================================================================

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_attachments_select_project_member"
  ON public.ticket_attachments FOR SELECT
  TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "ticket_attachments_insert_editor"
  ON public.ticket_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    can_edit_project(project_id)
    AND auth.uid() = uploaded_by
  );

CREATE POLICY "ticket_attachments_delete_uploader_or_admin"
  ON public.ticket_attachments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = uploaded_by
    OR is_project_admin(project_id)
  );

-- ============================================================================
-- STEP 5: Realtime (same pattern as ticket_assignees)
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_attachments;

-- ============================================================================
-- STEP 6: Storage bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments',
  'ticket-attachments',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public          = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS
-- Path structure: ticket-attachments/{projectId}/{uploadedByUserId}/{ticketId}/{uuid}[.ext]

DROP POLICY IF EXISTS "ticket_attachments_storage_select_member" ON storage.objects;
CREATE POLICY "ticket_attachments_storage_select_member"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND is_project_member((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "ticket_attachments_storage_insert_editor" ON storage.objects;
CREATE POLICY "ticket_attachments_storage_insert_editor"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND can_edit_project((storage.foldername(name))[1]::uuid)
    AND (storage.foldername(name))[2] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "ticket_attachments_storage_delete_uploader" ON storage.objects;
CREATE POLICY "ticket_attachments_storage_delete_uploader"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[2] = (auth.uid())::text
  );
