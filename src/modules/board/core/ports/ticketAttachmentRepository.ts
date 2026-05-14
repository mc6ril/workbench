import type {
  CreateTicketAttachmentInput,
  TicketAttachment,
  UploadTicketAttachmentInput,
} from "@/modules/board/core/domain/ticketAttachment.types";

export type TicketAttachmentRepository = {
  listByTicketId(ticketId: string): Promise<TicketAttachment[]>;
  create(input: CreateTicketAttachmentInput): Promise<TicketAttachment>;
  delete(id: string, storagePath: string): Promise<void>;
};

export type TicketAttachmentStorage = {
  upload(input: UploadTicketAttachmentInput): Promise<{
    storagePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  getSignedUrls(paths: string[]): Promise<Record<string, string>>;
  deleteFile(storagePath: string): Promise<void>;
};
