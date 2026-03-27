"use client";

import React, { type FormEvent, useState } from "react";

import { BUTTON_LABELS } from "@/shared/a11y/constants";
import ErrorMessage from "@/shared/design-system/error_message";
import Form from "@/shared/design-system/form";
import { useTranslation } from "@/shared/i18n";

import CreateTicketFormActions from "./components/CreateTicketFormActions";
import CreateTicketFormFields from "./components/CreateTicketFormFields";
import styles from "./CreateTicketForm.module.scss";
import type { CreateTicketFormValues, Option } from "./CreateTicketForm.types";
import { buildCreateTicketFormValues } from "./CreateTicketForm.utils";

export type { CreateTicketFormValues } from "./CreateTicketForm.types";

type Props = {
  initialValues?: Partial<CreateTicketFormValues>;
  statusOptions: Option[];
  labelOptions?: Option[];
  onSubmit: (values: CreateTicketFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  className?: string;
};

const CreateTicketForm = ({
  initialValues,
  statusOptions,
  labelOptions = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.board.createTicketForm");
  const tCommon = useTranslation("common");

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [status, setStatus] = useState(
    initialValues?.status ?? statusOptions[0]?.value ?? ""
  );
  const [labelIds, setLabelIds] = useState(initialValues?.labelIds ?? []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onSubmit(
      buildCreateTicketFormValues({
        title,
        description,
        status,
        labelIds,
      })
    );
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
      <CreateTicketFormFields
        title={title}
        description={description}
        status={status}
        labelIds={labelIds}
        statusOptions={statusOptions}
        labelOptions={labelOptions}
        isSubmitting={isSubmitting}
        titleLabel={t("fields.title")}
        statusLabel={t("fields.status")}
        labelsLabel={t("fields.labels")}
        descriptionLabel={t("fields.description")}
        onTitleChange={setTitle}
        onStatusChange={setStatus}
        onLabelIdsChange={setLabelIds}
        onDescriptionChange={setDescription}
      />

      {errorMessage && (
        <ErrorMessage message={errorMessage} title={t("errorGeneric")} />
      )}

      <CreateTicketFormActions
        submitLabel={t("submitButton")}
        submitAriaLabel={tCommon(BUTTON_LABELS.SUBMIT)}
        cancelLabel={t("cancelButton")}
        cancelAriaLabel={tCommon(BUTTON_LABELS.CANCEL)}
        canSubmit={Boolean(title)}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </Form>
  );
};

export default CreateTicketForm;
