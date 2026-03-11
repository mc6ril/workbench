"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/presentation/components/ui/Button";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Loader from "@/presentation/components/ui/Loader";
import Text from "@/presentation/components/ui/Text";
import { useSession } from "@/presentation/hooks/auth/useSession";
import { useAcceptInvitation } from "@/presentation/hooks/invitation/useAcceptInvitation";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

const JoinInvitationPage = () => {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const t = useTranslation("pages.join");
  const tErrors = useTranslation("errors");

  const { data: session, isLoading: isLoadingSession } = useSession();
  const acceptInvitationMutation = useAcceptInvitation();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isLoadingSession || hasStartedRef.current) {
      return;
    }

    const token = params?.token;
    if (!token || Array.isArray(token)) {
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
  }, [
    acceptInvitationMutation,
    isLoadingSession,
    params?.token,
    router,
    session,
  ]);

  const handleRetry = useCallback(() => {
    hasStartedRef.current = false;
    router.refresh();
  }, [router]);

  return (
    <main>
      <Loader variant="inline" />
      <Text variant="body">{t("processing")}</Text>
      {acceptInvitationMutation.error && (
        <>
          <ErrorMessage
            message={getErrorMessage(
              acceptInvitationMutation.error as { code?: string },
              tErrors
            )}
          />
          <Button
            label={t("retry")}
            onClick={handleRetry}
            aria-label={t("retryAriaLabel")}
          />
        </>
      )}
    </main>
  );
};

export default JoinInvitationPage;
