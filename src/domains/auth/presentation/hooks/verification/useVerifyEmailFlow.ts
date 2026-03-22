import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import { useVerifyEmail } from "@/domains/auth/presentation/hooks/verification/useVerifyEmail";
import {
  getVerifyEmailRedirectErrorCode,
  parseVerifyEmailParams,
} from "@/domains/auth/presentation/utils/verifyEmail";
import { useOptionalSession } from "@/domains/session/presentation/hooks/useOptionalSession";

/**
 * Encapsulates the full email verification orchestration.
 */
export const useVerifyEmailFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const tErrors = useTranslation("errors");
  const searchParamsValue = searchParams.toString();
  const locationHash =
    typeof window !== "undefined" ? window.location.hash : undefined;

  const parsedParams = useMemo(() => {
    return parseVerifyEmailParams(
      new URLSearchParams(searchParamsValue),
      locationHash
    );
  }, [locationHash, searchParamsValue]);
  const hasVerificationAttempt =
    !!parsedParams.input || !!parsedParams.redirectError;
  const recoverySessionQuery = useOptionalSession({
    enabled: hasVerificationAttempt,
    queryKeySuffix: [
      "verify-email-recovery",
      searchParamsValue,
      locationHash ?? "",
    ],
  });
  const hasRecoveredSession =
    hasVerificationAttempt && !!recoverySessionQuery.data;

  useEffect(() => {
    if (
      parsedParams.input &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate(parsedParams.input);
    }
  }, [parsedParams.input, verifyEmailMutation]);

  useEffect(() => {
    if (
      hasRecoveredSession ||
      (verifyEmailMutation.isSuccess && verifyEmailMutation.data?.session)
    ) {
      router.push(PAGE_ROUTES.WORKSPACE);
    }
  }, [
    hasRecoveredSession,
    verifyEmailMutation.isSuccess,
    verifyEmailMutation.data,
    router,
  ]);

  const redirectErrorCode = getVerifyEmailRedirectErrorCode(
    parsedParams.redirectError
  );
  const errorMessage = hasRecoveredSession
    ? undefined
    : parsedParams.redirectError
      ? redirectErrorCode
        ? getErrorMessage({ code: redirectErrorCode }, tErrors)
        : tErrors("auth.EMAIL_VERIFICATION_ERROR")
      : verifyEmailMutation.error
        ? getErrorMessage(
            verifyEmailMutation.error as { code?: string },
            tErrors
          )
        : undefined;

  return {
    isMissingToken: parsedParams.isMissingToken,
    isPending: verifyEmailMutation.isPending || recoverySessionQuery.isPending,
    isSuccess:
      hasRecoveredSession ||
      (verifyEmailMutation.isSuccess && !!verifyEmailMutation.data?.session),
    isError:
      !hasRecoveredSession &&
      (!!parsedParams.redirectError || verifyEmailMutation.isError),
    errorMessage,
  };
};
