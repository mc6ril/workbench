import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { removeAvatar } from "@/domains/profile/core/usecases/removeAvatar";
import { uploadAvatar } from "@/domains/profile/core/usecases/uploadAvatar";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys as boardQueryKeys } from "@/modules/board/presentation/hooks/queryKeys";

const PROJECT_MEMBERS_QUERY_KEY = ["members"] as const;

/**
 * Hook for uploading a user avatar.
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadAvatar(profileGateway, userId, file),
    onSuccess: (avatarUrl) => {
      queryClient.setQueryData<CurrentAuthIdentity | null>(
        authQueryKeys.authIdentity.current(),
        (current) => {
          if (!current) return current;
          return { ...current, avatarUrl };
        }
      );
      queryClient.invalidateQueries({
        queryKey: boardQueryKeys.tickets.assigneesRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: boardQueryKeys.comments.root(),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_MEMBERS_QUERY_KEY,
      });
    },
  });
};

/**
 * Hook for removing a user avatar.
 */
export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeAvatar(profileGateway, userId),
    onSuccess: () => {
      queryClient.setQueryData<CurrentAuthIdentity | null>(
        authQueryKeys.authIdentity.current(),
        (current) => {
          if (!current) return current;
          return { ...current, avatarUrl: null };
        }
      );
      queryClient.invalidateQueries({
        queryKey: boardQueryKeys.tickets.assigneesRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: boardQueryKeys.comments.root(),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_MEMBERS_QUERY_KEY,
      });
    },
  });
};
