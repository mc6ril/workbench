import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeAvatar } from "@/domains/project-management/core/usecases/profile/removeAvatar";
import { uploadAvatar } from "@/domains/project-management/core/usecases/profile/uploadAvatar";

import { userProfileRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for uploading a user avatar.
 * Invalidates the user profile query on success to reflect the new avatar.
 *
 * @returns Mutation object with mutate, mutateAsync, isPending, error, etc.
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
        queryKey: queryKeys.auth.session(),
      });
    },
  });
};

/**
 * Hook for removing a user avatar.
 * Invalidates the user profile query on success to clear the avatar.
 *
 * @returns Mutation object with mutate, mutateAsync, isPending, error, etc.
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
        queryKey: queryKeys.auth.session(),
      });
    },
  });
};
