"use client";

import { type SubmitEventHandler, useState } from "react";

import { BUTTON_LABELS } from "@/shared/a11y/constants";
import ErrorMessage from "@/shared/design-system/error_message";
import Form from "@/shared/design-system/form";
import { useTranslations } from "@/shared/i18n";

import CreateTicketFormActions from "./components/CreateTicketFormActions";
import CreateTicketFormFields from "./components/CreateTicketFormFields";
import styles from "./CreateTicketForm.module.scss";
import type { CreateTicketFormValues, Option } from "./CreateTicketForm.types";
import { buildCreateTicketFormValues } from "./CreateTicketForm.utils";

export type { CreateTicketFormValues } from "./CreateTicketForm.types";

type Props = {
  initialValues?: Partial<CreateTicketFormValues>;
  columnOptions: Option[];
  onSubmit: (values: CreateTicketFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  className?: string;
};

const CreateTicketForm = ({
  initialValues,
  columnOptions,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage,
  className,
}: Props) => {
  const t = useTranslations("pages.board.createTicketForm");
  const tCommon = useTranslations("common");

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [columnId, setColumnId] = useState(
    initialValues?.columnId ?? columnOptions[0]?.value ?? ""
  );

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event): void => {
    event.preventDefault();

    onSubmit(
      buildCreateTicketFormValues({
        title,
        description,
        columnId,
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
        columnId={columnId}
        columnOptions={columnOptions}
        titleLabel={t("fields.title")}
        statusLabel={t("fields.status")}
        descriptionLabel={t("fields.notes")}
        onTitleChange={setTitle}
        onColumnChange={setColumnId}
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
