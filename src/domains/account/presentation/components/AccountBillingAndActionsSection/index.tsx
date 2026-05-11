"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { getAccessibilityId } from "@/shared/a11y";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { navigateToDocumentPath } from "@/shared/navigation/documentNavigation";

import styles from "./styles.module.scss";

import { useDeleteUser } from "@/domains/auth/presentation/hooks/user/useDeleteUser";
import { useSignOut } from "@/domains/auth/presentation/hooks/user/useSignOut";

const AccountBillingAndActionsSection = () => {
  const t = useTranslations("pages.account");

  const signOutMutation = useSignOut();
  const deleteUserMutation = useDeleteUser();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const hiddenRuntimeConfigClickCountRef = useRef(0);
  const hiddenRuntimeConfigResetTimeoutRef = useRef<number | null>(null);

  const resetSecretEntranceSequence = useCallback(() => {
    hiddenRuntimeConfigClickCountRef.current = 0;

    if (hiddenRuntimeConfigResetTimeoutRef.current !== null) {
      window.clearTimeout(hiddenRuntimeConfigResetTimeoutRef.current);
      hiddenRuntimeConfigResetTimeoutRef.current = null;
    }
  }, []);

  const handleSecretEntranceClick = useCallback(() => {
    if (hiddenRuntimeConfigResetTimeoutRef.current !== null) {
      window.clearTimeout(hiddenRuntimeConfigResetTimeoutRef.current);
    }

    hiddenRuntimeConfigClickCountRef.current += 1;

    if (hiddenRuntimeConfigClickCountRef.current >= 5) {
      resetSecretEntranceSequence();
      navigateToDocumentPath(PAGE_ROUTES.RUNTIME_CONFIG_LAB);
      return;
    }

    hiddenRuntimeConfigResetTimeoutRef.current = window.setTimeout(() => {
      resetSecretEntranceSequence();
    }, 1500);
  }, [resetSecretEntranceSequence]);

  useEffect(() => {
    return () => {
      resetSecretEntranceSequence();
    };
  }, [resetSecretEntranceSequence]);

  const openDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    await deleteUserMutation.mutateAsync();
    closeDeleteModal();
  }, [closeDeleteModal, deleteUserMutation]);

  const handleSignOut = useCallback(() => {
    signOutMutation.mutate();
  }, [signOutMutation]);

  return (
    <>
      <section
        className={styles["account-section"]}
        aria-labelledby={getAccessibilityId("account-signout-title")}
      >
        <div className={styles["section-header"]}>
          <div
            className={styles["section-header__icon"]}
            aria-hidden="true"
            onClick={handleSecretEntranceClick}
          >
            {t("signOut.icon")}
          </div>
          <div>
            <Title
              variant="h2"
              id={getAccessibilityId("account-signout-title")}
              className={styles["section-title"]}
            >
              {t("signOut.title")}
            </Title>
            <p className={styles["section-description"]}>
              {t("signOut.description")}
            </p>
          </div>
        </div>

        <div className={styles["section-content"]}>
          <div className={styles["signout-item"]}>
            <div className={styles["signout-info"]}>
              <div className={styles["signout-label"]}>
                {t("signOut.label")}
              </div>
              <div className={styles["signout-description"]}>
                {t("signOut.descriptionText")}
              </div>
            </div>
            <Button
              label={
                signOutMutation.isPending
                  ? t("signOut.pendingButton")
                  : t("signOut.button")
              }
              variant="secondary"
              onClick={handleSignOut}
              disabled={signOutMutation.isPending}
              aria-label={t("signOut.buttonAriaLabel")}
            />
          </div>
        </div>
      </section>

      <section
        className={`${styles["account-section"]} ${styles["account-section--danger"]}`}
        aria-labelledby={getAccessibilityId("account-danger-zone-title")}
      >
        <div className={styles["section-header"]}>
          <div className={styles["section-header__icon"]} aria-hidden="true">
            {t("dangerZone.icon")}
          </div>
          <div>
            <Title
              variant="h2"
              id={getAccessibilityId("account-danger-zone-title")}
              className={styles["section-title"]}
            >
              {t("dangerZone.title")}
            </Title>
            <p className={styles["section-description"]}>
              {t("dangerZone.description")}
            </p>
          </div>
        </div>

        <div className={styles["section-content"]}>
          <div className={styles["danger-item"]}>
            <div className={styles["danger-info"]}>
              <div className={styles["danger-label"]}>
                {t("dangerZone.deleteAccount.label")}
              </div>
              <div className={styles["danger-description"]}>
                {t("dangerZone.deleteAccount.description")}
              </div>
            </div>
            <Button
              label={t("dangerZone.deleteButton")}
              variant="danger"
              onClick={openDeleteModal}
              aria-label={t("dangerZone.deleteButtonAriaLabel")}
            />
          </div>
        </div>
      </section>

      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title={t("dangerZone.confirmTitle")}
        size="medium"
      >
        <Text variant="small">{t("dangerZone.confirmMessage")}</Text>
        <div className={styles["modal-actions"]}>
          <Button
            label={
              deleteUserMutation.isPending
                ? t("dangerZone.deletingButton")
                : t("dangerZone.confirmButton")
            }
            variant="danger"
            onClick={() => {
              void handleDeleteAccount();
            }}
            disabled={deleteUserMutation.isPending}
            aria-label={t("dangerZone.confirmButtonAriaLabel")}
            fullWidth
          />
          <Button
            label={t("dangerZone.cancelButton")}
            variant="secondary"
            onClick={closeDeleteModal}
            fullWidth
          />
        </div>
      </Modal>
    </>
  );
};

export default React.memo(AccountBillingAndActionsSection);
