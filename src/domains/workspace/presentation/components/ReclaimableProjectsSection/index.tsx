"use client";

import { useMemo } from "react";

import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { getIntlLocale, useLocale, useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { ReclaimableProject } from "@/domains/workspace/core/domain/workspace.types";

type ReclaimableProjectsSectionProps = {
  projects: ReclaimableProject[];
  referenceTime: Date;
  reclaimingProjectId: string | null;
  onReclaimProject: (projectId: string) => void;
};

const ReclaimableProjectsSection = ({
  projects,
  referenceTime,
  reclaimingProjectId,
  onReclaimProject,
}: ReclaimableProjectsSectionProps) => {
  const tReclaim = useTranslations("pages.workspace.reclaimable");
  const locale = useLocale();
  const intlLocale = useMemo(() => getIntlLocale(locale), [locale]);
  const shortDateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [intlLocale]);

  return (
    <section className={styles.section} aria-label={tReclaim("sectionTitle")}>
      <div className={styles.banner}>
        <div className={styles.header}>
          <Title variant="h2">
            <span aria-hidden="true">📦</span>
            {tReclaim("sectionTitle")}
          </Title>
          <Text variant="small">{tReclaim("sectionDescription")}</Text>
        </div>
        <div className={styles.list}>
          {projects.map((project) => {
            const daysRemaining = Math.max(
              0,
              30 -
                Math.floor(
                  (referenceTime.getTime() - project.orphanedAt.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
            );
            const orphanedDate = shortDateFormatter.format(project.orphanedAt);

            return (
              <Card
                key={project.id}
                className={styles.card}
                bodyClassName={styles["card__body"]}
              >
                <div className={styles["card__info"]}>
                  <div className={styles["card__name"]}>{project.name}</div>
                  <div className={styles["card__meta"]}>
                    <span>
                      {tReclaim("orphanedSince", {
                        date: orphanedDate,
                      })}
                    </span>
                    <span>
                      {tReclaim("expiresIn", {
                        days: daysRemaining,
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  label={tReclaim("reclaimButton")}
                  onClick={() => onReclaimProject(project.id)}
                  disabled={reclaimingProjectId === project.id}
                  variant="secondary"
                  aria-label={tReclaim("reclaimButtonAriaLabel", {
                    name: project.name,
                  })}
                />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReclaimableProjectsSection;
