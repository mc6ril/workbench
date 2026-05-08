"use client";

import React, { useCallback, useMemo, useState } from "react";

import { getAccessibilityId } from "@/shared/a11y";
import Button from "@/shared/design-system/button";
import Input from "@/shared/design-system/input";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { getAppErrorCode } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useToastStore } from "@/shared/stores/useToastStore";

import styles from "./styles.module.scss";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import AvatarUpload from "@/domains/profile/presentation/components/AvatarUpload";
import {
  useRemoveAvatar,
  useUploadAvatar,
} from "@/domains/profile/presentation/hooks/useAvatarUpload";
import { useUpdateAccountIdentity } from "@/domains/settings/presentation/hooks/useUpdateAccountIdentity";
import { useViewer } from "@/domains/viewer/presentation/hooks/useViewer";

const AccountPersonalInfoSection = () => {
  const t = useTranslations("pages.account");
  const tErrors = useTranslations("errors");
  const tAvatar = useTranslations("ui.avatarUpload");
  const addToast = useToastStore((s) => s.addToast);

  const { data: identity } = useAuthIdentity();
  const { data: viewer } = useViewer();

  const updateAccountIdentityMutation = useUpdateAccountIdentity();
  const uploadAvatarMutation = useUploadAvatar();
  const removeAvatarMutation = useRemoveAvatar();

  const [emailDraft, setEmailDraft] = useState<string | undefined>(undefined);
  const [nameDraft, setNameDraft] = useState<string | undefined>(undefined);

  const email = emailDraft ?? viewer?.loginEmail ?? "";
  const name = nameDraft ?? viewer?.displayName ?? "";

  const accountIdentityErrorMessage = useMemo(() => {
    if (!updateAccountIdentityMutation.error) {
      return null;
    }
    return getErrorMessage(updateAccountIdentityMutation.error, tErrors);
  }, [tErrors, updateAccountIdentityMutation.error]);

  const getAvatarErrorMessage = useCallback(
    (error: unknown) => {
      const code = getAppErrorCode(error);
      if (code === INFRA_ERROR_CODE.AVATAR_FILE_TOO_LARGE) {
        return tAvatar("errorTooLarge");
      }
      if (code === INFRA_ERROR_CODE.AVATAR_INVALID_MIME_TYPE) {
        return tAvatar("errorInvalidType");
      }
      if (code === INFRA_ERROR_CODE.AVATAR_PROCESSING_FAILED) {
        return tAvatar("errorProcessing");
      }

      return getErrorMessage(error, tErrors);
    },
    [tAvatar, tErrors]
  );

  const onAvatarFileSelect = useCallback(
    async (file: File) => {
      if (!identity?.userId) {
        return;
      }

      try {
        await uploadAvatarMutation.mutateAsync({
          userId: identity.userId,
          file,
        });
        addToast({
          message: tAvatar("uploadSuccess"),
          variant: "success",
          duration: 4000,
        });
      } catch (error) {
        addToast({
          message: getAvatarErrorMessage(error),
          variant: "error",
          duration: 6000,
        });
      }
    },
    [addToast, getAvatarErrorMessage, identity, tAvatar, uploadAvatarMutation]
  );

  const onAvatarRemove = useCallback(async () => {
    if (!identity?.userId) {
      return;
    }

    try {
      await removeAvatarMutation.mutateAsync(identity.userId);
      addToast({
        message: tAvatar("removeSuccess"),
        variant: "success",
        duration: 4000,
      });
    } catch (error) {
      addToast({
        message: getAvatarErrorMessage(error),
        variant: "error",
        duration: 6000,
      });
    }
  }, [
    addToast,
    getAvatarErrorMessage,
    identity,
    removeAvatarMutation,
    tAvatar,
  ]);

  const onSave = useCallback(async () => {
    const currentDisplayName = viewer?.displayName ?? "";
    const currentEmail = viewer?.loginEmail ?? "";
    const nextDisplayName = name.trim();
    const nextEmail = email.trim();
    const updates: { displayName?: string; email?: string } = {};

    if (nextDisplayName !== currentDisplayName) {
      updates.displayName = nextDisplayName;
    }

    if (nextEmail !== currentEmail) {
      updates.email = nextEmail;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    await updateAccountIdentityMutation.mutateAsync(updates);
  }, [
    email,
    name,
    updateAccountIdentityMutation,
    viewer?.displayName,
    viewer?.loginEmail,
  ]);

  return (
    <section
      className={styles["account-section"]}
      aria-labelledby={getAccessibilityId("account-personal-info-title")}
    >
      <div className={styles["section-header"]}>
        <div className={styles["section-header__icon"]} aria-hidden="true">
          {t("personalInfo.icon")}
        </div>
        <div>
          <Title
            variant="h2"
            id={getAccessibilityId("account-personal-info-title")}
            className={styles["section-title"]}
          >
            {t("personalInfo.title")}
          </Title>
          <p className={styles["section-description"]}>
            {t("personalInfo.description")}
          </p>
        </div>
      </div>

      <div className={styles["section-content"]}>
        <AvatarUpload
          avatarUrl={viewer?.avatarUrl}
          name={name || email}
          disabled={!identity?.userId}
          isUploading={uploadAvatarMutation.isPending}
          isRemoving={removeAvatarMutation.isPending}
          onFileSelect={(file) => {
            void onAvatarFileSelect(file);
          }}
          onRemove={() => {
            void onAvatarRemove();
          }}
        />

        {updateAccountIdentityMutation.isSuccess && (
          <div
            className={styles["success-message"]}
            role="status"
            aria-live="polite"
          >
            {t("success.profileUpdated")}
          </div>
        )}

        {accountIdentityErrorMessage && (
          <div role="alert" aria-live="assertive">
            <Text variant="small">{accountIdentityErrorMessage}</Text>
          </div>
        )}

        <div className={styles["account-form"]}>
          <Input
            label={t("personalInfo.fields.name.label")}
            type="text"
            placeholder={t("personalInfo.fields.name.placeholder")}
            value={name}
            onChange={(e) => {
              setNameDraft(e.target.value);
            }}
          />

          <Input
            label={t("personalInfo.fields.email.label")}
            type="email"
            placeholder={t("personalInfo.fields.email.placeholder")}
            value={email}
            onChange={(e) => {
              setEmailDraft(e.target.value);
            }}
          />

          <div className={styles["form-actions"]}>
            <Button
              label={
                updateAccountIdentityMutation.isPending
                  ? t("personalInfo.savingButton")
                  : t("personalInfo.saveButton")
              }
              onClick={() => {
                void onSave();
              }}
              disabled={updateAccountIdentityMutation.isPending}
              aria-label={t("personalInfo.saveButtonAriaLabel")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AccountPersonalInfoSection);
