import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeAvatar } from "@/domains/profile/core/usecases/removeAvatar";
import { uploadAvatar } from "@/domains/profile/core/usecases/uploadAvatar";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import {
  clearLightUserCookieInBrowser,
  persistLightUserCookieInBrowser,
} from "@/domains/session/infrastructure/lightUserCookie";
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
    onSuccess: (avatarUrl, variables) => {
      persistLightUserCookieInBrowser({ avatarUrl });
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
    mutationFn: (userId: string) => removeAvatar(profileGateway, userId),
    onSuccess: (_data, userId) => {
      clearLightUserCookieInBrowser();
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
