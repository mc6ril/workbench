"use client";

import Link from "next/link";

import { useUpdatePasswordForm } from "@/presentation/hooks/auth/useUpdatePasswordForm";

import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/Button";
import Form from "@/shared/design-system/Form";
import Input from "@/shared/design-system/Input";
import Loader from "@/shared/design-system/Loader";
import PasswordStrengthIndicator from "@/shared/design-system/PasswordStrengthIndicator";
import Text from "@/shared/design-system/Text";
import Title from "@/shared/design-system/Title";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

const UpdatePasswordPage = () => {
  const t = useTranslation("pages.updatePassword");
  const tFields = useTranslation("pages.updatePassword.fields");

  const {
    passwordField,
    confirmPasswordField,
    onSubmit,
    passwordValue,
    passwordHint,
    passwordError,
    confirmPasswordError,
    rootError,
    isPending,
    isSuccess,
  } = useUpdatePasswordForm();

  return (
    <div className={styles["update-password-page"]}>
      <div className={styles["update-password-container"]}>
        <Title variant="h1" className={styles["update-password-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["update-password-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={onSubmit}
          className={styles["update-password-form"]}
          error={rootError}
          noValidate
        >
          <div className={styles["update-password-password-group"]}>
            <Input
              label={tFields("password.label")}
              type="password"
              autoComplete="new-password"
              required
              helperText={passwordHint}
              error={passwordError}
              {...passwordField}
            />
            <PasswordStrengthIndicator password={passwordValue} />
          </div>

          <Input
            label={tFields("confirmPassword.label")}
            type="password"
            autoComplete="new-password"
            required
            error={confirmPasswordError}
            {...confirmPasswordField}
          />

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={isPending}
            aria-label={t("buttonAriaLabel")}
            onClick={() => {}}
          />
        </Form>

        {isPending && <Loader variant="inline" />}

        {isSuccess && (
          <div
            className={styles["update-password-success"]}
            role="status"
            aria-live="polite"
          >
            <Text variant="body">{t("success")}</Text>
            <Text variant="body">{t("redirecting")}</Text>
          </div>
        )}

        <div className={styles["update-password-footer"]}>
          <Link
            href={AUTH_PAGE_ROUTES.SIGNIN}
            className={styles["update-password-link"]}
          >
            {t("backToSignin")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
