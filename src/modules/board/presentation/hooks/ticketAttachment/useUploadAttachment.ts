"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { APP_LIMITS } from "@/shared/constants/app";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { requireCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import type { UploadTicketAttachmentInput } from "@/modules/board/core/domain/ticketAttachment.types";
import {
  ticketAttachmentRepository,
  ticketAttachmentStorage,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

const LIMITS = APP_LIMITS.TICKET_ATTACHMENT;

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadTicketAttachmentInput) => {
      const allowed = LIMITS.ALLOWED_MIME_TYPES as readonly string[];
      if (!allowed.includes(input.file.type)) {
        throw new Error(`File type ${input.file.type} is not allowed`);
      }
      if (input.file.size > LIMITS.MAX_FILE_SIZE_BYTES) {
        throw new Error(
          `File exceeds ${LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB limit`
        );
      }

      const client = createSupabaseBrowserClient();
      const identity = await requireCurrentAuthIdentity(client);

      const uploaded = await ticketAttachmentStorage.upload(input);

      return ticketAttachmentRepository.create({
        ticketId: input.ticketId,
        projectId: input.projectId,
        storagePath: uploaded.storagePath,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        mimeType: uploaded.mimeType,
        uploadedBy: identity.userId,
      });
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ticketAttachments.byTicket(variables.ticketId),
      });
    },
  });
};
