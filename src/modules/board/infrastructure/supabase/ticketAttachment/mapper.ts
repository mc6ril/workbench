import { TableRow } from "@/shared/infrastructure/supabase/types";
import { toDate } from "@/shared/utils";

import { TicketAttachment } from "@/modules/board/core/domain/ticketAttachment.types";

export const mapRowToDomain = (
  row: TableRow<"ticket_attachments">
): TicketAttachment => ({
  id: row.id,
  ticketId: row.ticket_id,
  projectId: row.project_id,
  storagePath: row.storage_path,
  fileName: row.file_name,
  fileSize: row.file_size,
  mimeType: row.mime_type,
  uploadedBy: row.uploaded_by,
  createdAt: toDate(row.created_at),
});
