"use client";

import { use, useMemo } from "react";

import DashboardHeader from "@/presentation/components/dashboardHeader/DashboardHeader";
import { Container, Stack } from "@/presentation/components/ui";
import { useProject } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getLastUpdateContent } from "@/shared/utils";

import styles from "./ProjectPage.module.scss";

type DashboardHeaderContentProps = {
  name: string;
  updatedAt: Date;
};

const DashboardHeaderContent = ({ name, updatedAt }: DashboardHeaderContentProps) => {
  const t = useTranslation("pages.projectHome");

  const subtitle = useMemo(() => {
    const { days, hours } = getLastUpdateContent(updatedAt);

    if (days >= 7) {
      return t("lastActivityDate", {
        date: updatedAt.toLocaleDateString(),
      });
    }

    if (days >= 1) {
      return days === 1
        ? t("lastActivityDays", { days })
        : t("lastActivityDays_plural", { days });
    }

    if (hours > 0) {
      return hours === 1
        ? t("lastActivityHours", { hours })
        : t("lastActivityHours_plural", { hours });
    }

    return "";
  }, [updatedAt, t]);

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
    if(project) {
      return <DashboardHeaderContent name={project.name} updatedAt={project.updatedAt} />;
    } 
  }, [project]);

  return (
    <div className={styles["project-page"]}>
      <Container maxWidth="large" className={styles["project-page__container"]}>
        <Stack spacing="xl">
          {content}
        </Stack>
      </Container>
    </div>
  );
}; 

export default ProjectPage;
