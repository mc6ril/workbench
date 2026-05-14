"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { APP_LIMITS } from "@/shared/constants/app";
import SectionTitle from "@/shared/design-system/section_title";
import { useTranslations } from "@/shared/i18n";
import { isImageMimeType } from "@/shared/utils/guards";

import styles from "./TicketAttachmentsSection.module.scss";

import type { TicketAttachment } from "@/modules/board/core/domain/ticketAttachment.types";
import {
  useDeleteAttachment,
  useTicketAttachments,
  useUploadAttachment,
} from "@/modules/board/presentation/hooks/ticketAttachment";

const LIMITS = APP_LIMITS.TICKET_ATTACHMENT;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type Props = {
  ticketId: string;
  projectId: string;
  canEdit: boolean;
};

const TicketAttachmentsSection = ({ ticketId, projectId, canEdit }: Props) => {
  const t = useTranslations("pages.ticketDetail.page");
  const { data: attachments = [] } = useTicketAttachments(ticketId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment(ticketId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !canEdit) return;
      setValidationError(null);

      for (const file of Array.from(files)) {
        if (file.size > LIMITS.MAX_FILE_SIZE_BYTES) {
          setValidationError(t("attachments.fileTooLarge"));
          return;
        }
        const allowed = LIMITS.ALLOWED_MIME_TYPES as readonly string[];
        if (!allowed.includes(file.type)) {
          setValidationError(t("attachments.fileTypeNotAllowed"));
          return;
        }
        uploadMutation.mutate({ ticketId, projectId, file });
      }
    },
    [canEdit, projectId, t, ticketId, uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDelete = useCallback(
    (attachment: TicketAttachment) => {
      deleteMutation.mutate({
        id: attachment.id,
        storagePath: attachment.storagePath,
      });
    },
    [deleteMutation]
  );

  return (
    <div className={styles["attachments"]}>
      <SectionTitle>{t("sections.attachments")}</SectionTitle>

      {attachments.length > 0 ? (
        <ul className={styles["attachments__list"]}>
          {attachments.map((attachment) => (
            <li key={attachment.id} className={styles["attachments__item"]}>
              {isImageMimeType(attachment.mimeType) && attachment.signedUrl ? (
                <a
                  href={attachment.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["attachments__image-link"]}
                >
                  <Image
                    src={attachment.signedUrl}
                    alt={attachment.fileName}
                    className={styles["attachments__thumbnail"]}
                    width={200}
                    height={200}
                  />
                </a>
              ) : (
                <a
                  href={attachment.signedUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["attachments__file-link"]}
                  aria-label={attachment.fileName}
                >
                  <span className={styles["attachments__file-icon"]}>📎</span>
                  <span className={styles["attachments__file-name"]}>
                    {attachment.fileName}
                  </span>
                </a>
              )}
              <div className={styles["attachments__meta"]}>
                <span className={styles["attachments__file-size"]}>
                  {formatFileSize(attachment.fileSize)}
                </span>
                {canEdit ? (
                  <button
                    type="button"
                    className={styles["attachments__delete-btn"]}
                    aria-label={t("attachments.deleteFile")}
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(attachment)}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {canEdit ? (
        <>
          <div
            className={[
              styles["attachments__drop-zone"],
              dragOver ? styles["attachments__drop-zone--active"] : null,
              uploadMutation.isPending
                ? styles["attachments__drop-zone--uploading"]
                : null,
            ]
              .filter(Boolean)
              .join(" ")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
          >
            {uploadMutation.isPending
              ? "Uploading..."
              : t("attachments.dropZone")}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={LIMITS.ALLOWED_MIME_TYPES.join(",")}
            className={styles["attachments__file-input"]}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {validationError ? (
            <p className={styles["attachments__error"]}>{validationError}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default TicketAttachmentsSection;
