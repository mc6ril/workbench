import { APP_LIMITS } from "@/shared/constants/app";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import { prepareWebpImageUploadFile } from "@/shared/infrastructure/media/prepareWebpImageUploadFile.browser";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";
import { isImageMimeType } from "@/shared/utils/guards";

import { requireCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import type { UploadTicketAttachmentInput } from "@/modules/board/core/domain/ticketAttachment.types";
import type { TicketAttachmentStorage } from "@/modules/board/core/ports/ticketAttachmentRepository";

const LIMITS = APP_LIMITS.TICKET_ATTACHMENT;

const buildStoragePath = (
  projectId: string,
  userId: string,
  ticketId: string,
  fileName: string
): string => {
  const ext = fileName.includes(".") ? `.${fileName.split(".").pop()}` : "";
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  return `${projectId}/${userId}/${ticketId}/${uniqueName}`;
};

export const createTicketAttachmentStorage = (
  client: AppSupabaseClient
): TicketAttachmentStorage => ({
  async upload({ ticketId, projectId, file }: UploadTicketAttachmentInput) {
    const identity = await requireCurrentAuthIdentity(client);

    let uploadFile = file;
    let mimeType = file.type;

    if (isImageMimeType(file.type)) {
      uploadFile = await prepareWebpImageUploadFile(file, {
        maxDimensionPx: LIMITS.IMAGE_MAX_DIMENSION_PX,
        outputMimeType: LIMITS.IMAGE_OUTPUT_MIME_TYPE,
        outputQuality: LIMITS.IMAGE_OUTPUT_QUALITY,
        outputFilename: file.name.replace(/\.[^.]+$/, ".webp"),
      });
      mimeType = LIMITS.IMAGE_OUTPUT_MIME_TYPE;
    }

    const storagePath = buildStoragePath(
      projectId,
      identity.userId,
      ticketId,
      uploadFile.name
    );

    const { error } = await client.storage
      .from(LIMITS.STORAGE_BUCKET)
      .upload(storagePath, uploadFile, {
        upsert: false,
        contentType: mimeType,
      });

    if (error) {
      return handleRepositoryError(error, "TicketAttachment", storagePath);
    }

    return {
      storagePath,
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      mimeType,
    };
  },

  async getSignedUrls(paths: string[]): Promise<Record<string, string>> {
    if (paths.length === 0) return {};

    const { data, error } = await client.storage
      .from(LIMITS.STORAGE_BUCKET)
      .createSignedUrls(paths, LIMITS.SIGNED_URL_TTL_SECONDS);

    if (error) {
      return handleRepositoryError(error, "TicketAttachment");
    }

    const result: Record<string, string> = {};
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) {
        result[item.path] = item.signedUrl;
      }
    }
    return result;
  },

  async deleteFile(storagePath: string): Promise<void> {
    const { error } = await client.storage
      .from(LIMITS.STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      return handleRepositoryError(error, "TicketAttachment", storagePath);
    }
  },
});
