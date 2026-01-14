"use client";

import React, { useState } from "react";

import type { CreateEpicInput } from "@/core/domain/schema/epic.schema";

import {
  Button,
  ErrorMessage,
  Form,
  Input,
  Textarea,
} from "@/presentation/components/ui";

import { BUTTON_LABELS } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./CreateEpicForm.module.scss";

type Props = {
  projectId: string;
  initialValues?: Partial<CreateEpicInput>;
  onSubmit: (values: CreateEpicInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  className?: string;
};

/**
 * CreateEpicForm component renders a form for epic creation.
 * Delegates persistence to hooks/usecases at the page level.
 */
const CreateEpicForm = ({
  projectId,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.epics.createEpicForm");
  const tCommon = useTranslation("common");

  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onSubmit({
      projectId,
      name,
      description: description || undefined,
    });
  };

  const containerClasses = [styles["create-epic-form"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Form
      className={containerClasses}
      aria-label={t("title")}
      onSubmit={handleSubmit}
    >
      <div className={styles["create-epic-form__fields"]}>
        <div className={styles["create-epic-form__field"]}>
          <Input
            label={t("fields.name")}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            required
          />
        </div>
        <div className={styles["create-epic-form__field"]}>
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

      <div className={styles["create-epic-form__actions"]}>
        <Button
          label={t("submitButton")}
          type="submit"
          onClick={() => undefined}
          disabled={isSubmitting || !name}
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

export default CreateEpicForm;
