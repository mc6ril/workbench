"use client";

import React, { useState } from "react";

import Button from "@/presentation/components/ui/Button";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Form from "@/presentation/components/ui/Form";
import Input from "@/presentation/components/ui/Input";
import Select from "@/presentation/components/ui/Select";
import Textarea from "@/presentation/components/ui/Textarea";

import { BUTTON_LABELS } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./CreateTicketForm.module.scss";

type Option = {
  value: string;
  label: string;
};

export type CreateTicketFormValues = {
  title: string;
  description?: string;
  status: string;
  epicId?: string;
  labelIds?: string[];
};

type Props = {
  initialValues?: Partial<CreateTicketFormValues>;
  statusOptions: Option[];
  epicOptions: Option[];
  labelOptions?: Option[];
  showEpicField?: boolean;
  onSubmit: (values: CreateTicketFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  className?: string;
};

const CreateTicketForm = ({
  initialValues,
  statusOptions,
  epicOptions,
  labelOptions = [],
  showEpicField = true,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.backlog.createTicketForm");
  const tCommon = useTranslation("common");

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [status, setStatus] = useState(
    initialValues?.status ?? statusOptions[0]?.value ?? ""
  );
  const [epicId, setEpicId] = useState(initialValues?.epicId ?? "");
  const [labelIds, setLabelIds] = useState(initialValues?.labelIds ?? []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onSubmit({
      title,
      description: description || undefined,
      status,
      epicId: showEpicField ? epicId || undefined : undefined,
      labelIds,
    });
  };

  const containerClasses = [styles["create-ticket-form"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Form
      className={containerClasses}
      aria-label={t("title")}
      onSubmit={handleSubmit}
    >
      <div className={styles["create-ticket-form__fields"]}>
        <div className={styles["create-ticket-form__field"]}>
          <Input
            label={t("fields.title")}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            required
          />
        </div>
        <div
          className={`${styles["create-ticket-form__field"]} ${styles["create-ticket-form__field--half"]}`}
        >
          <Select
            label={t("fields.status")}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
            }}
            options={statusOptions}
          />
        </div>
        {showEpicField && (
          <div
            className={`${styles["create-ticket-form__field"]} ${styles["create-ticket-form__field--half"]}`}
          >
            <Select
              label={t("fields.epic")}
              value={epicId}
              onChange={(event) => {
                setEpicId(event.target.value);
              }}
              options={[
                { value: "", label: "" },
                ...epicOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
            />
          </div>
        )}
        <div
          className={`${styles["create-ticket-form__field"]} ${styles["create-ticket-form__field--half"]}`}
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
            multiple
            size={Math.min(4, Math.max(1, labelOptions.length))}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles["create-ticket-form__field"]}>
          <Textarea
            label={t("fields.description")}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <ErrorMessage message={errorMessage} title={t("errorGeneric")} />
      )}

      <div className={styles["create-ticket-form__actions"]}>
        <Button
          label={t("submitButton")}
          type="submit"
          disabled={isSubmitting || !title}
          aria-label={tCommon(BUTTON_LABELS.SUBMIT)}
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
  );
};

export default CreateTicketForm;
