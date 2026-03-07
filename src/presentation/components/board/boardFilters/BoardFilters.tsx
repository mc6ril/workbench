"use client";

import React from "react";

import { BoardFiltersProps } from "@/presentation/components/board/boardFilters/BoardFilters.types";
import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import Select from "@/presentation/components/ui/Select";
import Stack from "@/presentation/components/ui/Stack";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardFilters.module.scss";

const BoardFilters = ({
  search,
  status,
  epicId,
  assigneeId,
  statusOptions,
  epicOptions,
  assigneeOptions,
  onSearchChange,
  onStatusChange,
  onEpicChange,
  onAssigneeChange,
  onResetFilters,
  className,
}: BoardFiltersProps) => {
  const t = useTranslation("pages.board.filters");

  const filtersId = getAccessibilityId("board-filters");

  const containerClasses = [styles["board-filters"], className]
    .filter(Boolean)
    .join(" ");

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    onSearchChange(event.target.value);
  };

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = event.target.value || undefined;
    onStatusChange(value);
  };

  const handleEpicChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = event.target.value || undefined;
    onEpicChange(value);
  };

  const handleAssigneeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = event.target.value || undefined;
    onAssigneeChange(value);
  };

  return (
    <section
      className={containerClasses}
      aria-labelledby={filtersId}
      aria-label={t("searchLabel")}
    >
      <Title id={filtersId} variant="h2" className="visually-hidden">
        {t("searchLabel")}
      </Title>
      <Stack
        as="div"
        direction="horizontal"
        spacing="sm"
        className={styles["board-filters__row"]}
      >
        <div className={styles["board-filters__field"]}>
          <Input
            label={t("searchLabel")}
            value={search}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <div className={styles["board-filters__field"]}>
          <Select
            label={t("statusLabel")}
            value={status || ""}
            onChange={handleStatusChange}
            options={[
              { value: "", label: "" },
              ...statusOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
        </div>
        <div className={styles["board-filters__field"]}>
          <Select
            label={t("epicLabel")}
            value={epicId || ""}
            onChange={handleEpicChange}
            options={[
              { value: "", label: "" },
              ...epicOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
        </div>
        <div className={styles["board-filters__field"]}>
          <Select
            label={t("assigneeLabel")}
            value={assigneeId || ""}
            onChange={handleAssigneeChange}
            options={[
              { value: "", label: "" },
              ...assigneeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
        </div>
      </Stack>
      {onResetFilters && (
        <div className={styles["board-filters__actions"]}>
          <Button
            label={t("resetLabel")}
            onClick={onResetFilters}
            variant="secondary"
            aria-label={t("resetLabel")}
          />
        </div>
      )}
    </section>
  );
};

export default BoardFilters;
