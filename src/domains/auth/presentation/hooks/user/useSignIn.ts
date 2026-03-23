import { useTheme } from "next-themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { defaultLocale, matchSupportedLocale, persistLocaleCookie, useLocaleStore } from "@/shared/i18n";

import type { SignInInput } from "@/domains/auth/core/domain/auth.schema";
import { signInUser } from "@/domains/auth/core/usecases/user/signInUser";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";
import { resolveThemePreference } from "@/domains/profile/core/domain/profilePreferences.schema";
import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { userProfileRepository } from "@/domains/profile/infrastructure/userProfileRepository.browser";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

/**
 * Hook for signing in an existing user.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();
  const setLocale = useLocaleStore((state) => state.setLocale);
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: (input: SignInInput) => signInUser(authRepository, input),
    retry: false,
    onSuccess: async (result) => {
      await invalidatePostAuthMutation(queryClient, { includeProjects: true });

      const userId = result.session?.userId;

      if (!userId) {
        return;
      }

      try {
        const profile = await queryClient.fetchQuery({
          queryKey: profileQueryKeys.userProfiles.detail(userId),
          queryFn: () => getProfile(userProfileRepository, userId),
        });

        const nextLocale =
          matchSupportedLocale(profile?.preferences.language) ?? defaultLocale;
        const nextTheme = resolveThemePreference(profile?.preferences.theme);

        setLocale(nextLocale);
        persistLocaleCookie(nextLocale);
        setTheme(nextTheme);
      } catch (error) {
        console.warn("Failed to preload profile locale after sign-in", {
          userId,
          error,
        });
      }
    },
  });
};
