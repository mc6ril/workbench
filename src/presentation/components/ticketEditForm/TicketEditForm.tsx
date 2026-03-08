"use client";

import React, { useCallback, useMemo, useState } from "react";

import Button from "@/presentation/components/ui/Button";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Form from "@/presentation/components/ui/Form";
import Input from "@/presentation/components/ui/Input";
import Select from "@/presentation/components/ui/Select";
import Textarea from "@/presentation/components/ui/Textarea";

import { BUTTON_LABELS } from "@/shared/a11y/constants";
import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketEditForm.module.scss";

type Option = {
  value: string;
  label: string;
};

export type TicketEditFormValues = {
  title: string;
  description?: string;
  status?: string;
  epicId?: string | null;
  labelIds?: string[];
};

type Props = {
  initialValues: TicketEditFormValues;
  statusOptions: Option[];
  epicOptions: Option[];
  labelOptions?: Option[];
  onSubmit: (values: TicketEditFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  className?: string;
};

const TicketEditForm = ({
  initialValues,
  statusOptions,
  epicOptions,
  labelOptions = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.ticketEditForm");
  const tCommon = useTranslation("common");

  const baseId = useMemo(() => getAccessibilityId("ticket-edit-form"), []);
  const formTitleId = `${baseId}-title`;

  const [title, setTitle] = useState<string>(initialValues.title);
  const [description, setDescription] = useState<string>(
    initialValues.description ?? ""
  );
  const [status, setStatus] = useState<string>(
    initialValues.status ?? statusOptions[0]?.value ?? ""
  );
  const [epicId, setEpicId] = useState<string>(initialValues.epicId ?? "");
  const [labelIds, setLabelIds] = useState<string[]>(
    initialValues.labelIds ?? []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      onSubmit({
        title,
        description: description || undefined,
        status: status || undefined,
        epicId: epicId || null,
        labelIds,
      });
    },
    [description, epicId, labelIds, onSubmit, status, title]
  );

  const containerClasses = [styles["ticket-edit-form"], className]
    .filter(Boolean)
    .join(" ");

  const isSubmitDisabled = isSubmitting || title.trim().length === 0;

  return (
    <section className={containerClasses} aria-labelledby={formTitleId}>
      <Form aria-label={t("ariaLabel")} onSubmit={handleSubmit}>
        <h2 id={formTitleId} className={styles["ticket-edit-form__title"]}>
          {t("title")}
        </h2>

        <div className={styles["ticket-edit-form__fields"]}>
          <div className={styles["ticket-edit-form__field"]}>
            <Input
              label={t("fields.title")}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div
            className={`${styles["ticket-edit-form__field"]} ${styles["ticket-edit-form__field--half"]}`}
          >
            <Select
              label={t("fields.status")}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
              }}
              options={statusOptions}
              disabled={isSubmitting}
            />
          </div>

          <div
            className={`${styles["ticket-edit-form__field"]} ${styles["ticket-edit-form__field--half"]}`}
          >
            <Select
              label={t("fields.epic")}
              value={epicId}
              onChange={(event) => {
                setEpicId(event.target.value);
              }}
              options={[
                { value: "", label: t("epicNoneOption") },
                ...epicOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
              disabled={isSubmitting}
            />
          </div>

          <div
            className={`${styles["ticket-edit-form__field"]} ${styles["ticket-edit-form__field--half"]}`}
          >
            <Select
              label={t("fields.labels")}
              value={labelIds}
              onChange={(event) => {
                const nextLabelIds = Array.from(
                  event.target.selectedOptions,
                  (option) => option.value
                ).filter(Boolean);
                setLabelIds(nextLabelIds);
              }}
              options={labelOptions}
              disabled={isSubmitting}
              multiple
              size={Math.min(4, Math.max(1, labelOptions.length))}
            />
          </div>

          <div className={styles["ticket-edit-form__field"]}>
            <Textarea
              label={t("fields.description")}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {errorMessage && (
          <ErrorMessage message={errorMessage} title={t("errorGeneric")} />
        )}

        <div className={styles["ticket-edit-form__actions"]}>
          <Button
            label={t("saveButton")}
            type="submit"
            disabled={isSubmitDisabled}
            aria-label={tCommon(BUTTON_LABELS.SAVE)}
          />
          {onCancel && (
            <Button
              label={t("cancelButton")}
              onClick={onCancel}
              variant="secondary"
              disabled={isSubmitting}
              aria-label={tCommon(BUTTON_LABELS.CANCEL)}
            />
          )}
        </div>
      </Form>
    </section>
  );
};

export default React.memo(TicketEditForm);
