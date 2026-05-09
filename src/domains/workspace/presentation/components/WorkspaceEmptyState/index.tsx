"use client";

import Button from "@/shared/design-system/button";
import EmptyState from "@/shared/design-system/empty_state";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

type WorkspaceEmptyStateProps = {
  onCreateWorkspace: () => void;
};

const WorkspaceEmptyState = ({
  onCreateWorkspace,
}: WorkspaceEmptyStateProps) => {
  const t = useTranslations("pages.workspace");

  return (
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
        <Button
          label={t("addFirstProjectButton")}
          onClick={onCreateWorkspace}
          aria-label={t("addFirstProjectButtonAriaLabel")}
        />
      }
    />
  );
};

export default WorkspaceEmptyState;
