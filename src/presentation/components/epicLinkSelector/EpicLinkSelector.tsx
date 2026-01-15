"use client";

import React, { useCallback, useMemo } from "react";

import { Button, EmptyState, ErrorMessage, Loader, Select, Stack, Text, Title } from "@/presentation/components/ui";

import { BUTTON_LABELS, getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./EpicLinkSelector.module.scss";

type EpicOption = {
  id: string;
  name: string;
};

type Props = {
  epics: EpicOption[];
  selectedEpicId?: string | null;
  isLoading?: boolean;
  errorMessage?: string;
  onLink: (epicId: string) => void;
  onUnlink: () => void;
  className?: string;
};

const EpicLinkSelector = ({
  epics,
  selectedEpicId,
  isLoading = false,
  errorMessage,
  onLink,
  onUnlink,
  className,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.epicLinkSelector");
  const tCommon = useTranslation("common");

  const baseId = useMemo(() => getAccessibilityId("ticket-epic-link"), []);
  const titleId = `${baseId}-title`;

  const selectedEpicName =
    selectedEpicId && epics.length > 0
      ? epics.find((e) => e.id === selectedEpicId)?.name ?? null
      : null;

  const selectOptions = useMemo(
    () => [
      { value: "", label: t("noneOption") },
      ...epics.map((epic) => ({
        value: epic.id,
        label: epic.name,
      })),
    ],
    [epics, t]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const nextId = event.target.value;

      if (!nextId) {
        onUnlink();
        return;
      }

      onLink(nextId);
    },
    [onLink, onUnlink]
  );

  const handleUnlink = useCallback((): void => {
    onUnlink();
  }, [onUnlink]);

  const containerClasses = [styles["epic-link-selector"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={containerClasses} aria-labelledby={titleId}>
      <header className={styles["epic-link-selector__header"]}>
        <Title id={titleId} variant="h3" className={styles["epic-link-selector__title"]}>
          {t("title")}
        </Title>
      </header>

      {isLoading && (
        <div className={styles["epic-link-selector__state"]}>
          <Loader ariaLabel={t("loadingAriaLabel")} />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className={styles["epic-link-selector__state"]}>
          <ErrorMessage message={errorMessage} title={t("errorTitle")} />
        </div>
      )}

      {!isLoading && !errorMessage && epics.length === 0 && (
        <div className={styles["epic-link-selector__state"]}>
          <EmptyState
            title={t("emptyTitle")}
            message={t("emptyMessage")}
            ariaLabel={t("emptyAriaLabel")}
          />
        </div>
      )}

      {!isLoading && !errorMessage && epics.length > 0 && (
        <div className={styles["epic-link-selector__content"]}>
          <Select
            label={t("selectLabel")}
            value={selectedEpicId ?? ""}
            onChange={handleChange}
            options={selectOptions}
          />

          <Stack
            as="div"
            direction="horizontal"
            spacing="sm"
            className={styles["epic-link-selector__actions"]}
          >
            <Text as="span" variant="caption" className={styles["epic-link-selector__current"]}>
              {selectedEpicName
                ? t("currentEpic", { name: selectedEpicName })
                : t("noEpicSelected")}
            </Text>
            <Button
              label={t("unlinkButton")}
              onClick={handleUnlink}
              variant="secondary"
              disabled={!selectedEpicId}
              aria-label={tCommon(BUTTON_LABELS.REMOVE)}
            />
          </Stack>
        </div>
      )}
    </section>
  );
};

export default React.memo(EpicLinkSelector);

