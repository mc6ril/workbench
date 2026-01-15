"use client";

import React, { useState } from "react";

import {
  Button,
  ErrorMessage,
  Form,
  Input,
  Select,
  Textarea,
} from "@/presentation/components/ui";

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
};

type Props = {
  initialValues?: Partial<CreateTicketFormValues>;
  statusOptions: Option[];
  epicOptions: Option[];
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onSubmit({
      title,
      description: description || undefined,
      status,
      epicId: epicId || undefined,
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
