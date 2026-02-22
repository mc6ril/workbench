import React, { useCallback, useRef } from "react";

import Avatar from "@/presentation/components/ui/Avatar";
import Button from "@/presentation/components/ui/Button";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { APP_LIMITS } from "@/shared/constants/app";
import { useTranslation } from "@/shared/i18n";

import styles from "./AvatarUpload.module.scss";

const ACCEPTED_FILE_TYPES = APP_LIMITS.AVATAR.ALLOWED_MIME_TYPES.join(",");

type Props = {
  /** Current avatar URL */
  avatarUrl?: string | null;
  /** User display name (for initials fallback) */
  displayName?: string | null;
  /** Called when user selects a file */
  onUpload: (file: File) => void;
  /** Called when user removes avatar */
  onRemove: () => void;
  /** Whether an upload or removal is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
};

/**
 * Avatar upload component with preview, file selection, and removal.
 * Validates file type and size before calling onUpload.
 */
const AvatarUpload = ({
  avatarUrl,
  displayName,
  onUpload,
  onRemove,
  isLoading = false,
  error,
}: Props) => {
  const t = useTranslation("ui.avatarUpload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = getAccessibilityId("avatar-file-input");

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.size > APP_LIMITS.AVATAR.MAX_SIZE_BYTES) {
        return;
      }

      onUpload(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onUpload]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={styles["avatar-upload"]}
      role="group"
      aria-label={t("ariaLabel")}
    >
      <div className={styles["avatar-upload__preview"]}>
        <Avatar src={avatarUrl} name={displayName} size="xl" />
      </div>

      <div className={styles["avatar-upload__actions"]}>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className={styles["avatar-upload__input"]}
          aria-label={t("selectFile")}
          tabIndex={-1}
        />

        <Button
          label={avatarUrl ? t("change") : t("upload")}
          onClick={handleUploadClick}
          variant="secondary"
          disabled={isLoading}
          aria-label={avatarUrl ? t("changeAriaLabel") : t("uploadAriaLabel")}
        />

        {avatarUrl && (
          <Button
            label={t("remove")}
            onClick={onRemove}
            variant="ghost"
            disabled={isLoading}
            aria-label={t("removeAriaLabel")}
          />
        )}
      </div>

      {error && (
        <p className={styles["avatar-upload__error"]} role="alert">
          {error}
        </p>
      )}

      <p className={styles["avatar-upload__hint"]}>{t("hint")}</p>
    </div>
  );
};

export default React.memo(AvatarUpload);
