"use client";

import React, { useMemo } from "react";

import EpicProgress from "@/presentation/components/epicProgress/EpicProgress";
import { Button, Card, Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./EpicCard.module.scss";

type Props = {
  id: string;
  name: string;
  description?: string | null;
  progress: number;
  onViewDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

/**
 * EpicCard component displays epic information with progress and action buttons.
 * Includes full accessibility support with proper ARIA attributes.
 */
const EpicCard = ({
  id,
  name,
  description,
  progress,
  onViewDetail,
  onEdit,
  onDelete,
}: Props) => {
  const t = useTranslation("pages.epics.epicCard");

  const baseId = useMemo(() => getAccessibilityId(`epic-${id}`), [id]);

  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const handleViewDetail = (): void => {
    if (onViewDetail) {
      onViewDetail(id);
    }
  };

  const handleEdit = (): void => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = (): void => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const ariaLabelParts: string[] = [name];

  if (description) {
    ariaLabelParts.push(description);
  }

  ariaLabelParts.push(t("progressLabel", { progress }));

  const cardAriaLabel = `${t("epicAriaLabel")}: ${ariaLabelParts.join(", ")}`;
  const describedById = description ? descriptionId : undefined;

  return (
    <li
      className={styles["epic-card"]}
      aria-describedby={describedById}
      aria-label={cardAriaLabel}
    >
      <Card className={styles["epic-card__card"]}>
        <div className={styles["epic-card__header"]}>
          <Title
            id={titleId}
            variant="h3"
            className={styles["epic-card__title"]}
          >
            {name}
          </Title>
        </div>
        {description && (
          <Text
            id={descriptionId}
            as="p"
            variant="body"
            className={styles["epic-card__description"]}
          >
            {description}
          </Text>
        )}
        <div className={styles["epic-card__progress"]}>
          <EpicProgress progress={progress} id={id} />
        </div>
        <div className={styles["epic-card__actions"]}>
          {onViewDetail && (
            <Button
              label={t("viewDetailLabel")}
              onClick={handleViewDetail}
              variant="secondary"
            />
          )}
          {onEdit && (
            <Button
              label={t("editLabel")}
              onClick={handleEdit}
              variant="secondary"
            />
          )}
          {onDelete && (
            <Button
              label={t("deleteLabel")}
              onClick={handleDelete}
              variant="secondary"
            />
          )}
        </div>
      </Card>
    </li>
  );
};

export default React.memo(EpicCard);
