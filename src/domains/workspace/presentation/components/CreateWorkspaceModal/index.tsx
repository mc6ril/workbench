"use client";

import type {
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";

import {
  PROJECT_BOARD_EMOJI_PRESETS,
  type ProjectBoardEmojiPreset,
} from "@/shared/constants/projectBoardEmoji";
import Button from "@/shared/design-system/button";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { CreateProjectInput } from "@/domains/project/core/usecases/project/createProject";

type CreateWorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedEmoji: string;
  onSelectEmoji: (emoji: ProjectBoardEmojiPreset) => void;
  register: UseFormRegister<CreateProjectInput>;
  handleSubmit: UseFormHandleSubmit<CreateProjectInput>;
  onSubmit: SubmitHandler<CreateProjectInput>;
  errors: FieldErrors<CreateProjectInput>;
  isSubmitting: boolean;
};

const CreateWorkspaceModal = ({
  isOpen,
  onClose,
  selectedEmoji,
  onSelectEmoji,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
}: CreateWorkspaceModalProps) => {
  const t = useTranslations("pages.workspace");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("createWorkspaceTitle")}
      size="medium"
    >
      <Text variant="small" className={styles.description}>
        {t("createWorkspaceDescription")}
      </Text>
      <div
        className={styles["emoji-picker"]}
        role="group"
        aria-label={t("emojiPickerAriaLabel")}
      >
        <Text variant="small" className={styles["emoji-picker__label"]}>
          {t("emojiPickerLabel")}
        </Text>
        <div className={styles["emoji-picker__list"]}>
          {PROJECT_BOARD_EMOJI_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={
                emoji === selectedEmoji
                  ? `${styles["emoji-option"]} ${styles["emoji-option--selected"]}`
                  : styles["emoji-option"]
              }
              aria-label={t("emojiPickerOptionAriaLabel", { emoji })}
              onClick={() => onSelectEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        error={errors.root?.message}
        noValidate
      >
        <Input
          label={t("projectNameLabel")}
          type="text"
          autoComplete="off"
          required
          error={errors.name?.message}
          placeholder={t("projectNamePlaceholder")}
          {...register("name")}
        />
        <Button
          label={t("createButton")}
          type="submit"
          fullWidth
          disabled={isSubmitting}
          aria-label={t("createButtonAriaLabel")}
        />
      </Form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
