"use client";

import React, { useCallback, useRef } from "react";

import { APP_LIMITS } from "@/shared/constants/app";
import Avatar from "@/shared/design-system/avatar";
import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import { useTranslations } from "@/shared/i18n";

import styles from "./AvatarUpload.module.scss";

type Props = {
  avatarUrl?: string | null;
  name?: string | null;
  disabled?: boolean;
  isUploading?: boolean;
  isRemoving?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

const AvatarUpload = ({
  avatarUrl,
  name,
  disabled = false,
  isUploading = false,
  isRemoving = false,
  onFileSelect,
  onRemove,
}: Props) => {
  const t = useTranslations("ui.avatarUpload");
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = disabled || isUploading || isRemoving;

  const handleTriggerFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        onFileSelect(file);
      }

      // Allow re-selecting the same file after a failed upload.
      event.target.value = "";
    },
    [onFileSelect]
  );

  return (
    <div className={styles["avatar-upload"]} aria-label={t("ariaLabel")}>
      <div className={styles["avatar-upload__identity"]}>
        <Avatar src={avatarUrl} name={name} size="xl" />
        <div className={styles["avatar-upload__copy"]}>
          <Text variant="body" as="div">
            {name ?? t("selectFile")}
          </Text>
          <Text variant="small">{t("hint")}</Text>
        </div>
      </div>

      <div className={styles["avatar-upload__actions"]}>
        <input
          ref={inputRef}
          type="file"
          accept={APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES.join(",")}
          className={styles["avatar-upload__input"]}
          aria-label={t("selectFile")}
          disabled={isBusy}
          onChange={handleFileChange}
        />
        <Button
          label={avatarUrl ? t("change") : t("upload")}
          variant="secondary"
          disabled={isBusy}
          aria-label={avatarUrl ? t("changeAriaLabel") : t("uploadAriaLabel")}
          onClick={handleTriggerFileSelect}
        />
        {avatarUrl ? (
          <Button
            label={t("remove")}
            variant="ghost"
            disabled={isBusy}
            aria-label={t("removeAriaLabel")}
            onClick={onRemove}
          />
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(AvatarUpload);
