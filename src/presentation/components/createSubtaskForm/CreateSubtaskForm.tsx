"use client";

import React, { useCallback, useMemo, useState } from "react";

import { Button, ErrorMessage, Form, Input, Textarea } from "@/presentation/components/ui";

import { BUTTON_LABELS, getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./CreateSubtaskForm.module.scss";

export type CreateSubtaskFormValues = {
  title: string;
  description?: string;
};

type Props = {
  initialValues?: Partial<CreateSubtaskFormValues>;
  onSubmit: (values: CreateSubtaskFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  className?: string;
};

const CreateSubtaskForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.createSubtaskForm");
  const tCommon = useTranslation("common");

  const baseId = useMemo(() => getAccessibilityId("create-subtask-form"), []);
  const titleId = `${baseId}-title`;

  const [title, setTitle] = useState<string>(initialValues?.title ?? "");
  const [description, setDescription] = useState<string>(
    initialValues?.description ?? ""
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      onSubmit({
        title,
        description: description || undefined,
      });
    },
    [description, onSubmit, title]
  );

  const containerClasses = [styles["create-subtask-form"], className]
    .filter(Boolean)
    .join(" ");

  const isSubmitDisabled = isSubmitting || title.trim().length === 0;

  return (
    <section className={containerClasses} aria-labelledby={titleId}>
      <Form aria-label={t("ariaLabel")} onSubmit={handleSubmit}>
        <h3 id={titleId} className={styles["create-subtask-form__title"]}>
          {t("title")}
        </h3>

        <div className={styles["create-subtask-form__fields"]}>
          <div className={styles["create-subtask-form__field"]}>
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
          <div className={styles["create-subtask-form__field"]}>
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

        <div className={styles["create-subtask-form__actions"]}>
          <Button
            label={t("submitButton")}
            type="submit"
            disabled={isSubmitDisabled}
            aria-label={tCommon(BUTTON_LABELS.ADD)}
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

export default React.memo(CreateSubtaskForm);

