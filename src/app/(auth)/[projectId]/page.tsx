"use client";

import { use, useMemo } from "react";

import DashboardHeader from "@/presentation/components/dashboardHeader/DashboardHeader";
import { Container, Stack } from "@/presentation/components/ui";
import { useProject } from "@/presentation/hooks";
import { useLastActivitySubtitle } from "@/presentation/hooks/project/useLastActivitySubtitle";

import styles from "./ProjectPage.module.scss";

type DashboardHeaderContentProps = {
  name: string;
  updatedAt: Date;
};

const DashboardHeaderContent = ({
  name,
  updatedAt,
}: DashboardHeaderContentProps) => {
  const subtitle = useLastActivitySubtitle(updatedAt);

  return <DashboardHeader title={name} subtitle={subtitle} />;
};

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
  const { data: project } = useProject(projectId);

  const content = useMemo(() => {
    if (project) {
      return (
        <DashboardHeaderContent
          name={project.name}
          updatedAt={project.updatedAt}
        />
      );
    }
  }, [project]);

  return (
    <div className={styles["project-page"]}>
      <Container maxWidth="large" className={styles["project-page__container"]}>
        <Stack spacing="xl">{content}</Stack>
      </Container>
    </div>
  );
};

export default ProjectPage;
