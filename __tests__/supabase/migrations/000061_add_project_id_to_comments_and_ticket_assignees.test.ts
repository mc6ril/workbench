import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000061_add_project_id_to_comments_and_ticket_assignees.sql"
);

describe("000061_add_project_id_to_comments_and_ticket_assignees.sql", () => {
  it("adds denormalized project_id columns, backfills them, and indexes the common read paths", () => {
    expect(normalizedSql).toContain(
      "ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS project_id uuid"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE public.ticket_assignees ADD COLUMN IF NOT EXISTS project_id uuid"
    );
    expect(normalizedSql).toContain(
      "UPDATE public.comments c SET project_id = t.project_id FROM public.tickets t WHERE t.id = c.ticket_id AND c.project_id IS NULL"
    );
    expect(normalizedSql).toContain(
      "UPDATE public.ticket_assignees ta SET project_id = t.project_id FROM public.tickets t WHERE t.id = ta.ticket_id AND ta.project_id IS NULL"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_comments_project_id_created_at ON public.comments (project_id, created_at)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_ticket_assignees_project_id_ticket_id ON public.ticket_assignees (project_id, ticket_id)"
    );
  });

  it("installs database-owned sync triggers so project_id stays aligned with ticket_id", () => {
    expect(normalizedSql).toContain(
      "CREATE OR REPLACE FUNCTION public.sync_comment_project_id_from_ticket()"
    );
    expect(normalizedSql).toContain(
      "NEW.project_id := ( SELECT t.project_id FROM public.tickets t WHERE t.id = NEW.ticket_id )"
    );
    expect(normalizedSql).toContain(
      "RAISE EXCEPTION 'Ticket % not found for comment sync', NEW.ticket_id USING ERRCODE = 'foreign_key_violation'"
    );
    expect(normalizedSql).toContain(
      "CREATE TRIGGER trg_sync_comments_project_id BEFORE INSERT OR UPDATE OF ticket_id ON public.comments FOR EACH ROW EXECUTE FUNCTION public.sync_comment_project_id_from_ticket()"
    );
    expect(normalizedSql).toContain(
      "CREATE OR REPLACE FUNCTION public.sync_ticket_assignee_project_id_from_ticket()"
    );
    expect(normalizedSql).toContain(
      "NEW.project_id := ( SELECT t.project_id FROM public.tickets t WHERE t.id = NEW.ticket_id )"
    );
    expect(normalizedSql).toContain(
      "RAISE EXCEPTION 'Ticket % not found for ticket_assignees sync', NEW.ticket_id USING ERRCODE = 'foreign_key_violation'"
    );
    expect(normalizedSql).toContain(
      "CREATE TRIGGER trg_sync_ticket_assignees_project_id BEFORE INSERT OR UPDATE OF ticket_id ON public.ticket_assignees FOR EACH ROW EXECUTE FUNCTION public.sync_ticket_assignee_project_id_from_ticket()"
    );
    expect(normalizedSql).not.toContain("NEW.project_id = v_project_id");
    expect(normalizedSql).not.toContain("DECLARE v_project_id uuid");
  });

  it("guards against incomplete backfills before enforcing not-null project scoping", () => {
    expect(normalizedSql).toContain(
      "IF EXISTS (SELECT 1 FROM public.comments WHERE project_id IS NULL) THEN RAISE EXCEPTION 'comments.project_id backfill is incomplete'"
    );
    expect(normalizedSql).toContain(
      "IF EXISTS (SELECT 1 FROM public.ticket_assignees WHERE project_id IS NULL) THEN RAISE EXCEPTION 'ticket_assignees.project_id backfill is incomplete'"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE public.comments ALTER COLUMN project_id SET NOT NULL"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE public.ticket_assignees ALTER COLUMN project_id SET NOT NULL"
    );
  });
});
