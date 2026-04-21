"use client";

import { getAccessibilityId } from "@/shared/a11y";
import Badge from "@/shared/design-system/badge";
import Card from "@/shared/design-system/card";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

import { getProjectRoleLabelKey } from "@/domains/project/core/domain/project.types";
import type { ProjectWithStats } from "@/domains/workspace/core/domain/workspace.types";
import { getWorkspaceEmoji } from "@/domains/workspace/utils/workspaceUtils";

type WorkspaceProjectsSectionProps = {
  projects: ProjectWithStats[];
  referenceTime: Date;
  formatLastActivity: (updatedAt: Date, referenceTime: Date) => string;
  onOpenProject: (projectId: string) => void;
};

const WorkspaceProjectsSection = ({
  projects,
  referenceTime,
  formatLastActivity,
  onOpenProject,
}: WorkspaceProjectsSectionProps) => {
  const t = useTranslations("pages.workspace");
  const sectionTitleId = getAccessibilityId("workspace-main-title");

  return (
    <section aria-labelledby={sectionTitleId}>
      <div className={styles["section-header"]}>
        <Title variant="h1" id={sectionTitleId}>
          {t("yourWorkspacesTitle")}
        </Title>
        <Text variant="body">{t("sectionDescription")}</Text>
      </div>

      <div className={styles.grid}>
        {projects.map((project, index) => {
          const roleKey = getProjectRoleLabelKey(project.role);
          const roleLabel = t(roleKey);
          const openAriaLabel = t("openWorkspaceAriaLabel", {
            name: project.name,
            role: roleLabel,
          });

          return (
            <Card
              key={project.id}
              className={styles.card}
              bodyClassName={styles["card__body"]}
              onClick={() => onOpenProject(project.id)}
              ariaLabel={openAriaLabel}
            >
              <div className={styles["card__header"]}>
                <div className={styles.icon}>{getWorkspaceEmoji(index)}</div>
              </div>
              <Title variant="h2" className={styles["card__title"]}>
                {project.name}
              </Title>
              <Text variant="body" className={styles["card__description"]}>
                {formatLastActivity(project.updatedAt, referenceTime)}
              </Text>
              <div className={styles.meta}>
                <Text variant="body" className={styles["meta__item"]}>
                  <span aria-hidden="true">👥</span>
                  <span>
                    {t("membersCount", {
                      count: project.memberCount,
                    })}
                  </span>
                </Text>
                <Text variant="body" className={styles["meta__item"]}>
                  <span aria-hidden="true">📋</span>
                  <span>
                    {t("tasksCount", {
                      count: project.ticketCount,
                    })}
                  </span>
                </Text>
              </div>
              <Badge
                label={roleLabel}
                size="small"
                ariaLabel={`${t("roleAriaLabel")}: ${roleLabel}`}
                className={styles.badge}
              />
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <Text variant="metric" className={styles["stat__value"]}>
                    {project.inProgressCount}
                  </Text>
                  <Text variant="caption" className={styles["stat__label"]}>
                    {t("statInProgress")}
                  </Text>
                </div>
                <div className={styles.stat}>
                  <Text variant="metric" className={styles["stat__value"]}>
                    {project.completedCount}
                  </Text>
                  <Text variant="caption" className={styles["stat__label"]}>
                    {t("statCompleted")}
                  </Text>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default WorkspaceProjectsSection;
