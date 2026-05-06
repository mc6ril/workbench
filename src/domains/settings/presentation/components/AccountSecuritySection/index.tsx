"use client";

import React, { useCallback, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getAccessibilityId } from "@/shared/a11y";
import Button from "@/shared/design-system/button";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Loader from "@/shared/design-system/loader";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./styles.module.scss";

import type { ChangePasswordFormInput } from "@/domains/auth/presentation/forms/authForms.schema";
import { ChangePasswordFormSchema } from "@/domains/auth/presentation/forms/authForms.schema";
import { useChangePassword } from "@/domains/auth/presentation/hooks/password/useChangePassword";
import { useCanUpdatePassword } from "@/domains/session/presentation/hooks/useCanUpdatePassword";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

const AccountSecuritySection = () => {
  const t = useTranslations("pages.account");
  const tErrors = useTranslations("errors");

  const { data: session } = useSession();
  const { data: canUpdatePassword, isLoading: isPasswordCapabilityLoading } =
    useCanUpdatePassword(!!session?.userId);

  const changePasswordMutation = useChangePassword();

  const passwordErrorMessage = useMemo(() => {
    if (!changePasswordMutation.error) {
      return null;
    }
    return getErrorMessage(changePasswordMutation.error, tErrors);
  }, [changePasswordMutation.error, tErrors]);

  const {
    register,
    handleSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(ChangePasswordFormSchema),
    mode: "onBlur",
  });

  const onPasswordSubmit: SubmitHandler<ChangePasswordFormInput> = useCallback(
    async (data) => {
      await changePasswordMutation.mutateAsync(data.newPassword);
      resetPasswordForm();
    },
    [changePasswordMutation, resetPasswordForm]
  );

  const resolvedCanManagePassword = canUpdatePassword ?? true;

  return (
    <section
      className={styles["account-section"]}
      aria-labelledby={getAccessibilityId("account-security-title")}
    >
      <div className={styles["section-header"]}>
        <div className={styles["section-header__icon"]} aria-hidden="true">
          {t("security.icon")}
        </div>
        <div>
          <Title
            variant="h2"
            id={getAccessibilityId("account-security-title")}
            className={styles["section-title"]}
          >
            {t("security.title")}
          </Title>
          <p className={styles["section-description"]}>
            {t("security.description")}
          </p>
        </div>
      </div>

      <div className={styles["section-content"]}>
        {isPasswordCapabilityLoading ? (
          <Loader variant="inline" />
        ) : resolvedCanManagePassword ? (
          <>
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
                placeholder={t("security.fields.currentPassword.placeholder")}
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
                placeholder={t("security.fields.confirmPassword.placeholder")}
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
          </>
        ) : (
          <div
            className={styles["info-message"]}
            role="status"
            aria-live="polite"
          >
            <Text variant="small">{t("security.oauthNotice")}</Text>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(AccountSecuritySection);
