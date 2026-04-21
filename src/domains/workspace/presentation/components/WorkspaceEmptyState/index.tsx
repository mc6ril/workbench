"use client";

import { getAccessibilityId } from "@/shared/a11y";
import Button from "@/shared/design-system/button";
import EmptyState from "@/shared/design-system/empty_state";
import ErrorMessage from "@/shared/design-system/error_message";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

type WorkspaceEmptyStateProps = {
  showWelcomeGuide: boolean;
  gettingStartedErrorMessage: string | null;
  isGettingStartedPending: boolean;
  onCreateWorkspace: () => void;
  onSkipWelcomeGuide: () => void;
};

const WorkspaceEmptyState = ({
  showWelcomeGuide,
  gettingStartedErrorMessage,
  isGettingStartedPending,
  onCreateWorkspace,
  onSkipWelcomeGuide,
}: WorkspaceEmptyStateProps) => {
  const t = useTranslations("pages.workspace");
  const welcomeGuideTitleId = getAccessibilityId("workspace-welcome-guide");

  return (
    <>
      {showWelcomeGuide && (
        <section
          className={styles["welcome-guide"]}
          aria-labelledby={welcomeGuideTitleId}
        >
          <Title variant="h2" id={welcomeGuideTitleId}>
            {t("welcomeGuideTitle")}
          </Title>
          <Text variant="body">{t("welcomeGuideDescription")}</Text>
          {gettingStartedErrorMessage && (
            <ErrorMessage message={gettingStartedErrorMessage} />
          )}
          <div className={styles["welcome-guide__actions"]}>
            <Button
              label={t("welcomeGuidePrimaryCta")}
              onClick={onCreateWorkspace}
              aria-label={t("welcomeGuidePrimaryCtaAriaLabel")}
            />
            <Button
              label={t("welcomeGuideSkipCta")}
              onClick={onSkipWelcomeGuide}
              aria-label={t("welcomeGuideSkipCtaAriaLabel")}
              variant="ghost"
              disabled={isGettingStartedPending}
            />
          </div>
        </section>
      )}

      <EmptyState
        title={t("emptyStateCardTitle")}
        message={t("emptyStateCardDescription")}
        icon={<span>✨</span>}
        ariaLabel={t("emptyStateCardTitle")}
        className={styles["empty-state"]}
        iconClassName={styles["empty-state__icon"]}
        titleClassName={styles["empty-state__title"]}
        messageClassName={styles["empty-state__description"]}
        actionClassName={styles["empty-state__action"]}
        action={
          !showWelcomeGuide ? (
            <Button
              label={t("addFirstProjectButton")}
              onClick={onCreateWorkspace}
              aria-label={t("addFirstProjectButtonAriaLabel")}
            />
          ) : undefined
        }
      />
    </>
  );
};

export default WorkspaceEmptyState;
