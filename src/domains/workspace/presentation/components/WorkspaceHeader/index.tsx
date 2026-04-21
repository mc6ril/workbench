"use client";

import Button from "@/shared/design-system/button";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

type WorkspaceHeaderProps = {
  displayName?: string | null;
  onCreateWorkspace: () => void;
};

const WorkspaceHeader = ({
  displayName,
  onCreateWorkspace,
}: WorkspaceHeaderProps) => {
  const t = useTranslations("pages.workspace");
  const resolvedDisplayName = displayName?.trim() || t("userFallbackName");

  return (
    <header className={styles.header}>
      <div className={styles["header__content"]}>
        <div className={styles.welcome}>
          <Title variant="h1">
            {t("welcomeBanner", { name: resolvedDisplayName })}
          </Title>
        </div>
        <div className={styles["header__actions"]}>
          <Button
            label={t("addWorkspaceButton")}
            onClick={onCreateWorkspace}
            aria-label={t("addWorkspaceButtonAriaLabel")}
          />
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
