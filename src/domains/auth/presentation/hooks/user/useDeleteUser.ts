import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { createAppError } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { navigateToDocumentPath } from "@/shared/navigation/documentNavigation";

import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

/**
 * Hook for deleting the current user account.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ROUTES.AUTH.DELETE_USER, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createAppError(INFRA_ERROR_CODE.DELETE_ACCOUNT_FAILED, {
          debugMessage:
            typeof errorData.error === "string"
              ? errorData.error
              : "Failed to delete user account",
        });
      }
    },
    onSuccess: async () => {
      await invalidatePostAuthMutation(queryClient);
      queryClient.clear();
      navigateToDocumentPath(PAGE_ROUTES.HOME);
    },
  });
};
