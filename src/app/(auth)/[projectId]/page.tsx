"use client";

import { use } from "react";

import DashboardHeader from "@/presentation/components/dashboardHeader/DashboardHeader";
import ShortcutsWidget from "@/presentation/components/shortcutsWidget/ShortcutsWidget";
import { Container, Stack } from "@/presentation/components/ui";

import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectPage.module.scss";

/**
 * Project root page (Home).
 * This route is the landing dashboard for a single project.
 */
const ProjectPage = ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = use(params);
  const t = useTranslation("pages.projectHome");

  return (
    <div className={styles["project-page"]}>
      <Container
        as="main"
        maxWidth="large"
        className={styles["project-page__container"]}
      >
        <Stack spacing="xl">
          <DashboardHeader title={t("title")} subtitle={t("subtitle")} />
          <ShortcutsWidget
            projectId={projectId}
            translationNamespace="pages.projectHome.shortcutsWidget"
          />
        </Stack>
      </Container>
    </div>
  );
};

export default ProjectPage;
