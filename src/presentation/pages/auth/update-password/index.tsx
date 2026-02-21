"use client";

import Link from "next/link";

import {
  Button,
  Form,
  Input,
  Loader,
  PasswordStrengthIndicator,
  Text,
  Title,
} from "@/presentation/components/ui";
import { useUpdatePasswordForm } from "@/presentation/hooks/auth/useUpdatePasswordForm";

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
          <Link href="/auth/signin" className={styles["update-password-link"]}>
            {t("backToSignin")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
