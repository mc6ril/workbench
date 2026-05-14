export type TicketAttachment = {
  id: string;
  ticketId: string;
  projectId: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string | null;
  createdAt: Date;
  /** Signed URL for private bucket access — generated client-side, not persisted. */
  signedUrl?: string;
};

export type CreateTicketAttachmentInput = {
  ticketId: string;
  projectId: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
};

export type UploadTicketAttachmentInput = {
  ticketId: string;
  projectId: string;
  file: File;
};
