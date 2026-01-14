"use client";

import React from "react";

import {
  Button,
  Input,
  Select,
  Stack,
  Title,
} from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketFilters.module.scss";

type Option = {
  value: string;
  label: string;
};

type Props = {
  search: string;
  status?: string;
  epicId?: string;
  statusOptions: Option[];
  epicOptions: Option[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: string) => void;
  onEpicChange: (value?: string) => void;
  onResetFilters?: () => void;
  className?: string;
};

const TicketFilters = ({
  search,
  status,
  epicId,
  statusOptions,
  epicOptions,
  onSearchChange,
  onStatusChange,
  onEpicChange,
  onResetFilters,
  className,
}: Props) => {
  const t = useTranslation("pages.backlog.filters");

  const filtersId = getAccessibilityId("backlog-ticket-filters");

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

  const containerClasses = [styles["ticket-filters"], className]
    .filter(Boolean)
    .join(" ");

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
        className={styles["ticket-filters__row"]}
      >
        <div className={styles["ticket-filters__field"]}>
          <Input
            label={t("searchLabel")}
            value={search}
            onChange={handleSearchChange}
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <div className={styles["ticket-filters__field"]}>
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
        <div className={styles["ticket-filters__field"]}>
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
      </Stack>
      {onResetFilters && (
        <div className={styles["ticket-filters__actions"]}>
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

export default TicketFilters;
