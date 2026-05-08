import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import {
  buildAuthCallbackPath,
  VERIFIED_EMAIL_REDIRECT_PATH,
} from "@/shared/utils/authRedirect";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { useVerifyEmail } from "@/domains/auth/presentation/hooks/verification/useVerifyEmail";
import {
  getVerifyEmailRedirectErrorCode,
  parseVerifyEmailParams,
} from "@/domains/auth/presentation/utils/verifyEmail";

/**
 * Encapsulates the full email verification orchestration.
 */
export const useVerifyEmailFlow = () => {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const tErrors = useTranslations("errors");
  const searchParamsValue = searchParams.toString();
  const locationHash =
    typeof window !== "undefined" ? window.location.hash : undefined;

  const parsedParams = useMemo(() => {
    return parseVerifyEmailParams(
      new URLSearchParams(searchParamsValue),
      locationHash
    );
  }, [locationHash, searchParamsValue]);
  const shouldExchangeCode = !!parsedParams.input?.code;
  const recoveryIdentityQuery = useAuthIdentity({
    enabled: parsedParams.shouldRecoverSession,
    queryKeySuffix: [
      "verify-email-recovery",
      searchParamsValue,
      locationHash ?? "",
    ],
  });
  const hasRecoveredSession =
    parsedParams.shouldRecoverSession && !!recoveryIdentityQuery.data;
  const hasSessionRecoveryError =
    parsedParams.shouldRecoverSession &&
    !recoveryIdentityQuery.isPending &&
    !recoveryIdentityQuery.data;

  useEffect(() => {
    if (parsedParams.input?.code) {
      router.replace(
        buildAuthCallbackPath({
          code: parsedParams.input.code,
          nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
          fallbackPath: VERIFIED_EMAIL_REDIRECT_PATH,
        })
      );
    }
  }, [parsedParams.input?.code, router]);

  useEffect(() => {
    if (
      parsedParams.input &&
      !parsedParams.input.code &&
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
        ? getErrorMessage(verifyEmailMutation.error, tErrors)
        : hasSessionRecoveryError
          ? tErrors("auth.EMAIL_VERIFICATION_ERROR")
          : undefined;

  return {
    isMissingToken: parsedParams.isMissingToken,
    isPending:
      shouldExchangeCode ||
      verifyEmailMutation.isPending ||
      recoveryIdentityQuery.isPending,
    isSuccess:
      hasRecoveredSession ||
      (verifyEmailMutation.isSuccess && !!verifyEmailMutation.data?.session),
    isError:
      !hasRecoveredSession &&
      (!!parsedParams.redirectError ||
        verifyEmailMutation.isError ||
        hasSessionRecoveryError),
    errorMessage,
  };
};
