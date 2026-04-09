"use client";

import Link from "next/link";

import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

import { useResetPasswordForm } from "@/domains/auth/presentation/hooks/password/useResetPasswordForm";

const ResetPasswordPage = () => {
  const t = useTranslations("pages.resetPassword");
  const tCommon = useTranslations("common");

  const { emailField, onSubmit, emailError, rootError, isPending, isSuccess } =
    useResetPasswordForm();

  if (isSuccess) {
    return (
      <div className={styles["reset-password-page"]}>
        <div className={styles["reset-password-container"]}>
          <Title variant="h1" className={styles["reset-password-title"]}>
            {t("title")}
          </Title>
          <div
            className={styles["reset-password-success"]}
            role="status"
            aria-live="polite"
          >
            <Text variant="body">{t("success.message")}</Text>
            <Text variant="body">{t("success.instructions")}</Text>
          </div>
          <div className={styles["reset-password-footer"]}>
            <Link
              href={AUTH_PAGE_ROUTES.SIGNIN}
              className={styles["reset-password-link"]}
            >
              {t("backToSignin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["reset-password-page"]}>
      <div className={styles["reset-password-container"]}>
        <Title variant="h1" className={styles["reset-password-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["reset-password-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={onSubmit}
          className={styles["reset-password-form"]}
          error={rootError}
          noValidate
        >
          <Input
            label={tCommon("email")}
            type="email"
            autoComplete="email"
            required
            error={emailError}
            {...emailField}
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

        <div className={styles["reset-password-footer"]}>
          <Link
            href={AUTH_PAGE_ROUTES.SIGNIN}
            className={styles["reset-password-link"]}
          >
            {t("backToSignin")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
