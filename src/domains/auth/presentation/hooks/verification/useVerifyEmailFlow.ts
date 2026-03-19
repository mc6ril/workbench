import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import { useVerifyEmail } from "@/domains/auth/presentation/hooks/verification/useVerifyEmail";

/**
 * Encapsulates the full email verification orchestration.
 */
export const useVerifyEmailFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const tErrors = useTranslation("errors");

  const { token, email, isValid } = useMemo(() => {
    const tokenParam = searchParams.get("token");
    const codeParam = searchParams.get("code");
    const typeParam = searchParams.get("type");
    const emailParam = searchParams.get("email");

    const actualToken = tokenParam || codeParam;

    const isValidTokenFormat =
      typeParam === "email" && actualToken && emailParam;
    const isValidCodeFormat =
      codeParam !== null && (typeParam === null || typeParam === "email");

    return {
      token: actualToken,
      email: emailParam || null,
      isValid: isValidTokenFormat || isValidCodeFormat,
    };
  }, [searchParams]);

  useEffect(() => {
    if (
      isValid &&
      token &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate({
        email: email || "",
        token,
      });
    }
  }, [isValid, token, email, verifyEmailMutation]);

  useEffect(() => {
    if (verifyEmailMutation.isSuccess && verifyEmailMutation.data?.session) {
      router.push(PAGE_ROUTES.WORKSPACE);
    }
  }, [verifyEmailMutation.isSuccess, verifyEmailMutation.data, router]);

  const errorMessage = verifyEmailMutation.error
    ? getErrorMessage(verifyEmailMutation.error as { code?: string }, tErrors)
    : undefined;

  return {
    isMissingToken: !token,
    isPending: verifyEmailMutation.isPending,
    isSuccess:
      verifyEmailMutation.isSuccess && !!verifyEmailMutation.data?.session,
    isError: verifyEmailMutation.isError,
    errorMessage,
  };
};
