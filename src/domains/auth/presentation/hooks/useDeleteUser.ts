import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";

import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Hook for deleting the current user account.
 * Calls the server-side API route that performs the deletion with admin privileges.
 * Permanently deletes the user account and redirects to the landing page.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ROUTES.AUTH.DELETE_USER, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete user account");
      }
    },
    onSuccess: () => {
      // Invalidate all auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      // Clear all queries
      queryClient.clear();
      // Redirect to landing page
      router.push(PAGE_ROUTES.HOME);
    },
  });
};
