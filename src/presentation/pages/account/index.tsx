"use client";

import { useCallback, useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ChangePasswordFormInput } from "@/core/domain/schema/auth.schema";
import { ChangePasswordFormSchema } from "@/core/domain/schema/auth.schema";

import {
  Button,
  Form,
  Input,
  Link,
  Loader,
  Modal,
  Select,
  Text,
  Toggle,
} from "@/presentation/components/ui";
import {
  useChangePassword,
  useDeleteUser,
  useSession,
  useUpdateProfile,
} from "@/presentation/hooks";

import { getAccessibilityId } from "@/shared/a11y";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import {
  defaultLocale,
  supportedLocaleOptions,
  useTranslation,
} from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./styles.module.scss";

const LANGUAGE_SELECT_OPTIONS = supportedLocaleOptions.map((locale) => ({
  value: locale.code,
  label: locale.label,
}));

const AccountPage = () => {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const deleteUserMutation = useDeleteUser();
  const t = useTranslation("pages.account");
  const tErrors = useTranslation("errors");

  const [emailDraft, setEmailDraft] = useState<string | undefined>(undefined);
  const [nameDraft, setNameDraft] = useState<string | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<string>(defaultLocale);

  const email = emailDraft ?? session?.email ?? "";
  const name = nameDraft ?? session?.displayName ?? "";

  const profileErrorMessage = useMemo(
    () =>
      updateProfileMutation.error
        ? getErrorMessage(
            updateProfileMutation.error as { code?: string },
            tErrors
          )
        : null,
    [updateProfileMutation.error, tErrors]
  );

  const passwordErrorMessage = useMemo(
    () =>
      changePasswordMutation.error
        ? getErrorMessage(
            changePasswordMutation.error as { code?: string },
            tErrors
          )
        : null,
    [changePasswordMutation.error, tErrors]
  );

  const {
    register,
    handleSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(ChangePasswordFormSchema),
    mode: "onBlur",
  });

  const handleProfileSave = useCallback(async () => {
    await updateProfileMutation.mutateAsync({ displayName: name, email });
  }, [updateProfileMutation, name, email]);

  const onPasswordSubmit: SubmitHandler<ChangePasswordFormInput> = useCallback(
    async (data) => {
      await changePasswordMutation.mutateAsync(data.newPassword);
      resetPasswordForm();
    },
    [changePasswordMutation, resetPasswordForm]
  );

  const openDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    await deleteUserMutation.mutateAsync();
    closeDeleteModal();
  }, [deleteUserMutation, closeDeleteModal]);

  if (isSessionLoading) {
    return (
      <main className={styles["account-page"]}>
        <Loader variant="full-page" />
      </main>
    );
  }

  return (
    <main className={styles["account-page"]}>
      <header className={styles["account-header"]}>
        <div className={styles["account-header__content"]}>
          <Link
            href={PAGE_ROUTES.WORKSPACE}
            className={styles["back-link"]}
            ariaLabel={t("header.label")}
          >
            ← {t("header.label")}
          </Link>
          <div className={styles["account-welcome"]}>
            <h1 className={styles["account-welcome__title"]}>
              {t("header.title")}
            </h1>
            <p className={styles["account-welcome__subtitle"]}>
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className={styles["account-container"]}>
        {/* Personal Information */}
        <section
          className={styles["account-section"]}
          aria-labelledby={getAccessibilityId("account-personal-info-title")}
        >
          <div className={styles["section-header"]}>
            <div className={styles["section-header__icon"]} aria-hidden="true">
              {t("personalInfo.icon")}
            </div>
            <div>
              <h2
                id={getAccessibilityId("account-personal-info-title")}
                className={styles["section-title"]}
              >
                {t("personalInfo.title")}
              </h2>
              <p className={styles["section-description"]}>
                {t("personalInfo.description")}
              </p>
            </div>
          </div>

          <div className={styles["section-content"]}>
            {updateProfileMutation.isSuccess && (
              <div
                className={styles["success-message"]}
                role="status"
                aria-live="polite"
              >
                {t("success.profileUpdated")}
              </div>
            )}

            {profileErrorMessage && (
              <div role="alert" aria-live="assertive">
                <Text variant="small">{profileErrorMessage}</Text>
              </div>
            )}

            <div className={styles["account-form"]}>
              <Input
                label={t("personalInfo.fields.name.label")}
                type="text"
                placeholder={t("personalInfo.fields.name.placeholder")}
                value={name}
                onChange={(e) => setNameDraft(e.target.value)}
              />

              <Input
                label={t("personalInfo.fields.email.label")}
                type="email"
                placeholder={t("personalInfo.fields.email.placeholder")}
                value={email}
                onChange={(e) => setEmailDraft(e.target.value)}
              />

              <div className={styles["form-actions"]}>
                <Button
                  label={
                    updateProfileMutation.isPending
                      ? t("personalInfo.savingButton")
                      : t("personalInfo.saveButton")
                  }
                  onClick={handleProfileSave}
                  disabled={updateProfileMutation.isPending}
                  aria-label={t("personalInfo.saveButtonAriaLabel")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section
          className={styles["account-section"]}
          aria-labelledby={getAccessibilityId("account-security-title")}
        >
          <div className={styles["section-header"]}>
            <div className={styles["section-header__icon"]} aria-hidden="true">
              {t("security.icon")}
            </div>
            <div>
              <h2
                id={getAccessibilityId("account-security-title")}
                className={styles["section-title"]}
              >
                {t("security.title")}
              </h2>
              <p className={styles["section-description"]}>
                {t("security.description")}
              </p>
            </div>
          </div>

          <div className={styles["section-content"]}>
            {changePasswordMutation.isSuccess && (
              <div
                className={styles["success-message"]}
                role="status"
                aria-live="polite"
              >
                {t("success.passwordChanged")}
              </div>
            )}

            {passwordErrorMessage && (
              <div role="alert" aria-live="assertive">
                <Text variant="small">{passwordErrorMessage}</Text>
              </div>
            )}

            <Form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className={styles["account-form"]}
              noValidate
            >
              <Input
                label={t("security.fields.currentPassword.label")}
                type="password"
                placeholder={t(
                  "security.fields.currentPassword.placeholder"
                )}
                error={passwordErrors.currentPassword?.message}
                {...register("currentPassword")}
              />

              <Input
                label={t("security.fields.newPassword.label")}
                type="password"
                placeholder={t("security.fields.newPassword.placeholder")}
                error={passwordErrors.newPassword?.message}
                {...register("newPassword")}
              />

              <Input
                label={t("security.fields.confirmPassword.label")}
                type="password"
                placeholder={t(
                  "security.fields.confirmPassword.placeholder"
                )}
                error={passwordErrors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <div className={styles["form-actions"]}>
                <Button
                  label={
                    changePasswordMutation.isPending
                      ? t("security.changingButton")
                      : t("security.changeButton")
                  }
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  aria-label={t("security.changeButtonAriaLabel")}
                />
              </div>
            </Form>
          </div>
        </section>

        {/* Preferences */}
        <section
          className={styles["account-section"]}
          aria-labelledby={getAccessibilityId("account-preferences-title")}
        >
          <div className={styles["section-header"]}>
            <div className={styles["section-header__icon"]} aria-hidden="true">
              {t("preferences.icon")}
            </div>
            <div>
              <h2
                id={getAccessibilityId("account-preferences-title")}
                className={styles["section-title"]}
              >
                {t("preferences.title")}
              </h2>
              <p className={styles["section-description"]}>
                {t("preferences.description")}
              </p>
            </div>
          </div>

          <div className={styles["section-content"]}>
            <div className={styles["preference-item"]}>
              <div className={styles["preference-info"]}>
                <div className={styles["preference-label"]}>
                  {t("preferences.emailNotifications.label")}
                </div>
                <div className={styles["preference-description"]}>
                  {t("preferences.emailNotifications.description")}
                </div>
              </div>
              <Toggle
                label=""
                checked={emailNotifications}
                onChange={setEmailNotifications}
                aria-label={t("preferences.emailNotifications.label")}
              />
            </div>

            <div className={styles["preference-item"]}>
              <div className={styles["preference-info"]}>
                <div className={styles["preference-label"]}>
                  {t("preferences.darkMode.label")}
                </div>
                <div className={styles["preference-description"]}>
                  {t("preferences.darkMode.description")}
                </div>
              </div>
              <Toggle
                label=""
                checked={darkMode}
                onChange={setDarkMode}
                aria-label={t("preferences.darkMode.label")}
              />
            </div>

            <div className={styles["preference-item"]}>
              <div className={styles["preference-info"]}>
                <div className={styles["preference-label"]}>
                  {t("preferences.language.label")}
                </div>
                <div className={styles["preference-description"]}>
                  {t("preferences.language.description")}
                </div>
              </div>
              <Select
                label=""
                options={LANGUAGE_SELECT_OPTIONS}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label={t("preferences.language.label")}
              />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section
          className={`${styles["account-section"]} ${styles["account-section--danger"]}`}
          aria-labelledby={getAccessibilityId("account-danger-zone-title")}
        >
          <div className={styles["section-header"]}>
            <div className={styles["section-header__icon"]} aria-hidden="true">
              {t("dangerZone.icon")}
            </div>
            <div>
              <h2
                id={getAccessibilityId("account-danger-zone-title")}
                className={styles["section-title"]}
              >
                {t("dangerZone.title")}
              </h2>
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
      </div>

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
            onClick={handleDeleteAccount}
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
    </main>
  );
};

export default AccountPage;
