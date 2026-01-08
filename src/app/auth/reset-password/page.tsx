"use client";

import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ResetPasswordInput } from "@/core/domain/schema/auth.schema";
import { ResetPasswordSchema } from "@/core/domain/schema/auth.schema";

import Button from "@/presentation/components/ui/Button";
import Form from "@/presentation/components/ui/Form";
import Input from "@/presentation/components/ui/Input";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";
import { useResetPassword } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./ResetPasswordPage.module.scss";

type FormData = ResetPasswordInput;

const ResetPasswordPage = () => {
  const resetPasswordMutation = useResetPassword();
  const t = useTranslation("pages.resetPassword");
  const tCommon = useTranslation("common");
  const tErrors = useTranslation("errors");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (resetPasswordMutation.error) {
      const error = resetPasswordMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      // Map domain errors to form fields
      if (
        error.code === "INVALID_EMAIL" ||
        error.code === "PASSWORD_RESET_ERROR"
      ) {
        setError("email", {
          type: "server",
          message: errorMessage,
        });
      } else {
        // General error - set on root
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      }
    }
  }, [resetPasswordMutation.error, setError, tErrors]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    resetPasswordMutation.mutate(data);
  };

  // Show success message after email sent
  if (resetPasswordMutation.isSuccess) {
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
            <Link href="/auth/signin" className={styles["reset-password-link"]}>
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
          onSubmit={handleSubmit(onSubmit)}
          className={styles["reset-password-form"]}
          error={errors.root?.message}
          noValidate
        >
          <Input
            label={tCommon("email")}
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={resetPasswordMutation.isPending}
            aria-label={t("buttonAriaLabel")}
            onClick={() => {}}
          />
        </Form>

        <div className={styles["reset-password-footer"]}>
          <Link href="/auth/signin" className={styles["reset-password-link"]}>
            {t("backToSignin")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
