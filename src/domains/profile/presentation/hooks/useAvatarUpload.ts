import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeAvatar } from "@/domains/profile/core/usecases/removeAvatar";
import { uploadAvatar } from "@/domains/profile/core/usecases/uploadAvatar";
import { userProfileRepository } from "@/domains/profile/infrastructure/userProfileRepository.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { queryKeys as boardQueryKeys } from "@/modules/board/presentation/hooks/queryKeys";

const PROJECT_MEMBERS_QUERY_KEY = ["members"] as const;

/**
 * Hook for uploading a user avatar.
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadAvatar(userProfileRepository, userId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfiles.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfiles.root(),
      });
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
    mutationFn: (userId: string) => removeAvatar(userProfileRepository, userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfiles.detail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfiles.root(),
      });
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
