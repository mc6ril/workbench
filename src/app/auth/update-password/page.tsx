"use client";

import { Suspense, useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";

import type { UpdatePasswordInput } from "@/core/domain/schema/auth.schema";
import {
  type UpdatePasswordFormInput,
  UpdatePasswordFormSchema,
  UpdatePasswordSchema,
} from "@/core/domain/schema/auth.schema";

import { Button, Form, Input, Loader, Text, Title } from "@/presentation/components/ui";
import { useUpdatePassword } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./UpdatePasswordPage.module.scss";

const UpdatePasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className={styles["update-password-page"]}>
          <Loader variant="inline" />
        </div>
      }
    >
      <UpdatePasswordContent />
    </Suspense>
  );
};

const UpdatePasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updatePasswordMutation = useUpdatePassword();
  const t = useTranslation("pages.updatePassword");
  const tErrors = useTranslation("errors");

  // Extract token/code and email from URL parameters using useMemo
  // Supabase can redirect with either token or code parameter
  const { token, email, isValid } = useMemo(() => {
    const tokenParam = searchParams.get("token");
    const codeParam = searchParams.get("code");
    const typeParam = searchParams.get("type");
    const emailParam = searchParams.get("email");

    // Use code as token if token is not available (Supabase redirects with code to root)
    const actualToken = tokenParam || codeParam;

    // Only proceed if type is 'recovery' (password reset) and we have a token/code
    // For token format, we need type='recovery' and token
    // For code format, we also need type='recovery' and code
    // Email is optional (Supabase may not include it in code-based redirects)
    const isValidType = typeParam === "recovery" && actualToken !== null;

    return {
      token: isValidType ? actualToken : null,
      email: emailParam || null, // Email may be null for code format
      isValid: isValidType,
    };
  }, [searchParams]);

  type FormData = UpdatePasswordFormInput;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(UpdatePasswordFormSchema),
    mode: "onBlur",
  });

  /**
   * Maps domain validation error messages to i18n messages.
   * This keeps i18n in the presentation layer while using domain schemas.
   */
  const getTranslatedErrorMessage = (
    field: keyof FormData,
    message: string | undefined
  ): string | undefined => {
    if (!message) {
      return undefined;
    }

    // Map domain error messages to i18n keys
    if (message.includes("at least")) {
      return t("validation.passwordMinLength");
    }
    if (message.includes("less than")) {
      return t("validation.passwordMaxLength");
    }
    if (message.includes("confirmation is required")) {
      return t("validation.confirmPasswordRequired");
    }
    if (message.includes("do not match")) {
      return t("validation.passwordsDoNotMatch");
    }
    if (message.includes("Invalid email format")) {
      return t("errors.invalidEmail");
    }

    return message;
  };

  useEffect(() => {
    if (updatePasswordMutation.error) {
      const error = updatePasswordMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      // Map domain errors
      if (
        error.code === "INVALID_TOKEN" ||
        error.code === "PASSWORD_RESET_ERROR"
      ) {
        setError("root", {
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
  }, [updatePasswordMutation.error, setError, tErrors]);

  // Redirect to workspace after successful password update
  useEffect(() => {
    if (
      updatePasswordMutation.isSuccess &&
      updatePasswordMutation.data?.session
    ) {
      // Auto-login successful, redirect to workspace
      router.push("/workspace");
    }
  }, [updatePasswordMutation.isSuccess, updatePasswordMutation.data, router]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!token) {
      setError("root", {
        type: "server",
        message: t("errors.missingToken"),
      });
      return;
    }

    // Build UpdatePasswordInput and validate with domain schema
    const updatePasswordInput: UpdatePasswordInput = {
      password: data.password,
      token,
      email: email || "", // Empty string if email not provided (code format)
    };

    // Validate with domain schema before sending to API
    // This ensures data matches domain requirements (token, email format, etc.)
    try {
      UpdatePasswordSchema.parse(updatePasswordInput);
    } catch (error) {
      // Domain validation error - should not happen if form validation passed
      // but we validate again for safety
      let errorMessage = t("errors.validationFailed");

      // Extract and translate specific validation error messages from Zod
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        if (firstIssue?.message) {
          const translated = getTranslatedErrorMessage(
            "password",
            firstIssue.message
          );
          if (translated) {
            errorMessage = translated;
          }
        }
      }

      setError("root", {
        type: "validation",
        message: errorMessage,
      });
      return;
    }

    updatePasswordMutation.mutate(updatePasswordInput);
  };

  // Show error if token is missing
  // Email is optional (code format doesn't require email in URL)
  if (!token || !isValid) {
    return (
      <div className={styles["update-password-page"]}>
        <div className={styles["update-password-container"]}>
          <Title variant="h1" className={styles["update-password-title"]}>
            {t("title")}
          </Title>
          <div className={styles["update-password-error"]} role="alert">
            {t("errors.missingToken")}
          </div>
          <div className={styles["update-password-footer"]}>
            <Link
              href="/auth/signin"
              className={styles["update-password-link"]}
            >
              {t("backToSignin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          onSubmit={handleSubmit(onSubmit)}
          className={styles["update-password-form"]}
          error={errors.root?.message}
          noValidate
        >
          <Input
            label={t("fields.password")}
            type="password"
            autoComplete="new-password"
            required
            error={getTranslatedErrorMessage(
              "password",
              errors.password?.message
            )}
            {...register("password")}
          />

          <Input
            label={t("fields.confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            error={getTranslatedErrorMessage(
              "confirmPassword",
              errors.confirmPassword?.message
            )}
            {...register("confirmPassword")}
          />

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={updatePasswordMutation.isPending}
            aria-label={t("buttonAriaLabel")}
            onClick={() => {}}
          />
        </Form>

        {updatePasswordMutation.isPending && <Loader variant="inline" />}

        {updatePasswordMutation.isSuccess &&
          updatePasswordMutation.data?.session && (
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
