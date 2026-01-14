"use client";

import React, { useMemo } from "react";

import type { EpicWithProgress } from "@/core/domain/schema/epic.schema";

import EpicCard from "@/presentation/components/epicCard/EpicCard";
import {
  EmptyState,
  ErrorMessage,
  Loader,
  Text,
  Title,
} from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./EpicsList.module.scss";

type Props = {
  epics: EpicWithProgress[];
  isLoading?: boolean;
  errorMessage?: string;
  onItemViewDetail?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  className?: string;
};

/**
 * EpicsList component displays a list of epics with loading, error, and empty states.
 * Includes full accessibility support with proper ARIA attributes.
 */
const EpicsList = ({
  epics,
  isLoading = false,
  errorMessage,
  onItemViewDetail,
  onItemEdit,
  onItemDelete,
  className,
}: Props) => {
  const t = useTranslation("pages.epics.epicsList");

  const listId = useMemo(() => getAccessibilityId("epics-list"), []);

  const listClasses = [styles["epics-list"], className]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <div className={listClasses}>
        <Loader ariaLabel={t("ariaLabel")} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={listClasses}>
        <ErrorMessage message={errorMessage} title={t("errorTitle")} />
      </div>
    );
  }

  if (epics.length === 0) {
    return (
      <div className={listClasses}>
        <EmptyState
          title={t("emptyTitle")}
          message={t("emptyMessage")}
          ariaLabel={t("ariaLabel")}
        />
      </div>
    );
  }

  return (
    <section className={listClasses} aria-labelledby={listId}>
      <div className={styles["epics-list__header"]}>
        <Title id={listId} variant="h2" className={styles["epics-list__title"]}>
          {t("title")}
        </Title>
        <Text as="p" variant="caption" className={styles["epics-list__meta"]}>
          {t("count", { count: epics.length })}
        </Text>
      </div>
      <ul className={styles["epics-list__items"]} aria-label={t("ariaLabel")}>
        {epics.map((epic) => (
          <EpicCard
            key={epic.id}
            id={epic.id}
            name={epic.name}
            description={epic.description}
            progress={epic.progress}
            onViewDetail={onItemViewDetail}
            onEdit={onItemEdit}
            onDelete={onItemDelete}
          />
        ))}
      </ul>
    </section>
  );
};

export default EpicsList;
