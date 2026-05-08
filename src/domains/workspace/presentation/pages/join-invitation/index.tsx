"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { useAcceptInvitation } from "@/domains/project/presentation/hooks/invitation/useAcceptInvitation";

const JoinInvitationPage = () => {
  const params = useParams<{ token: string }>();
  const router = useAppRouter();
  const t = useTranslations("pages.join");
  const tErrors = useTranslations("errors");

  const { data: identity, isLoading: isLoadingIdentity } = useAuthIdentity();
  const acceptInvitationMutation = useAcceptInvitation();
  const hasStartedRef = useRef(false);
  const rawToken = params?.token;
  const token = typeof rawToken === "string" ? rawToken : undefined;
  const invitationError = acceptInvitationMutation.error as {
    code?: string;
  } | null;
  const errorDetail = invitationError
    ? getErrorMessage(invitationError, tErrors)
    : undefined;
  const hasInvitationError = Boolean(invitationError);

  useEffect(() => {
    if (isLoadingIdentity || hasStartedRef.current) {
      return;
    }

    if (!token) {
      return;
    }

    if (!identity) {
      const redirect = encodeURIComponent(`/join/${token}`);
      router.replace(`/auth/signin?redirect=${redirect}`);
      return;
    }

    hasStartedRef.current = true;
    acceptInvitationMutation
      .mutateAsync(token)
      .then((result) => {
        router.replace(`/${result.projectId}/board`);
      })
      .catch(() => {
        hasStartedRef.current = false;
      });
  }, [acceptInvitationMutation, identity, isLoadingIdentity, router, token]);

  const handleRetry = useCallback(() => {
    hasStartedRef.current = false;
    router.refresh();
  }, [router]);

  if (!token || hasInvitationError) {
    return (
      <RouteFallbackPage
        tone="error"
        eyebrow={t("errorEyebrow")}
        statusLabel={t("errorStatus")}
        statusValue={t("errorStatusValue")}
        title={t("errorTitle")}
        message={t("errorMessage")}
        detail={errorDetail}
        actions={[
          {
            label: t("retry"),
            ariaLabel: t("retryAriaLabel"),
            onClick: handleRetry,
            variant: "primary",
          },
          {
            label: t("backToWorkspace"),
            ariaLabel: t("backToWorkspaceAriaLabel"),
            href: PAGE_ROUTES.WORKSPACE,
          },
        ]}
      />
    );
  }

  return (
    <RouteFallbackPage
      tone="loading"
      eyebrow={t("processingEyebrow")}
      statusLabel={t("processingStatus")}
      title={t("processingTitle")}
      message={t("processingMessage")}
      detail={t("processingDetail")}
      ariaLabel={t("processingAriaLabel")}
    />
  );
};

export default JoinInvitationPage;
