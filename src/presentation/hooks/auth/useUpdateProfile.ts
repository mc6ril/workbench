import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateProfileInput } from "@/domains/project-management/core/domain/schema/userProfile.schema";

import { updateUser } from "@/domains/project-management/core/usecases/auth/updateUser";
import { updateProfile } from "@/domains/project-management/core/usecases/profile/updateProfile";

import {
  authRepository,
  userProfileRepository,
} from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

import { useSession } from "./useSession";

/**
 * Hook for updating user profile (display name) and optionally email.
 * Display name is written to user_profiles; email change goes through auth.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput & { email?: string }) => {
      if (input.displayName !== undefined && session) {
        await updateProfile(userProfileRepository, session.userId, {
          displayName: input.displayName,
        });
      }

      if (input.email) {
        await updateUser(authRepository, { email: input.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      if (session) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userProfiles.detail(session.userId),
        });
      }
    },
  });
};
