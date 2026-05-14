import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type {
  AppSupabaseClient,
  TableInsert,
} from "@/shared/infrastructure/supabase/types";

import type {
  CreateTicketAttachmentInput,
  TicketAttachment,
} from "@/modules/board/core/domain/ticketAttachment.types";
import type { TicketAttachmentRepository } from "@/modules/board/core/ports/ticketAttachmentRepository";
import { mapRowToDomain } from "@/modules/board/infrastructure/supabase/ticketAttachment/mapper";

export const createTicketAttachmentRepository = (
  client: AppSupabaseClient
): TicketAttachmentRepository => ({
  async listByTicketId(ticketId: string): Promise<TicketAttachment[]> {
    try {
      const { data, error } = await client
        .from("ticket_attachments")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) {
        return handleRepositoryError(error, "TicketAttachment");
      }

      return (data ?? []).map(mapRowToDomain);
    } catch (error) {
      return handleRepositoryError(error, "TicketAttachment");
    }
  },

  async create(input: CreateTicketAttachmentInput): Promise<TicketAttachment> {
    try {
      const insert: TableInsert<"ticket_attachments"> = {
        ticket_id: input.ticketId,
        project_id: input.projectId,
        storage_path: input.storagePath,
        file_name: input.fileName,
        file_size: input.fileSize,
        mime_type: input.mimeType,
        uploaded_by: input.uploadedBy,
      };

      const { data, error } = await client
        .from("ticket_attachments")
        .insert(insert)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "TicketAttachment");
      }

      return mapRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "TicketAttachment");
    }
  },

  async delete(id: string, storagePath: string): Promise<void> {
    try {
      const { error } = await client
        .from("ticket_attachments")
        .delete()
        .eq("id", id);

      if (error) {
        return handleRepositoryError(error, "TicketAttachment");
      }

      const { error: storageError } = await client.storage
        .from("ticket-attachments")
        .remove([storagePath]);

      if (storageError) {
        return handleRepositoryError(storageError, "TicketAttachment");
      }
    } catch (error) {
      return handleRepositoryError(error, "TicketAttachment");
    }
  },
});
