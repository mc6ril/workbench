"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import { useAcceptInvitation } from "@/domains/project/presentation/hooks/invitation/useAcceptInvitation";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

const JoinInvitationPage = () => {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const t = useTranslation("pages.join");
  const tErrors = useTranslation("errors");

  const { data: session, isLoading: isLoadingSession } = useSession();
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
    if (isLoadingSession || hasStartedRef.current) {
      return;
    }

    if (!token) {
      return;
    }

    if (!session) {
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
  }, [acceptInvitationMutation, isLoadingSession, router, session, token]);

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
