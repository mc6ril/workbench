"use client";

import { Suspense, useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { UpdatePasswordInput } from "@/core/domain/auth.schema";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useUpdatePassword } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";

import styles from "./UpdatePasswordPage.module.scss";

/**
 * Creates Zod schema for update password form with i18n messages.
 * Validates password requirements and confirmation match.
 */
const createUpdatePasswordFormSchema = (t: (key: string) => string) => {
  return z
    .object({
      password: z
        .string()
        .min(6, t("validation.passwordMinLength"))
        .max(100, t("validation.passwordMaxLength")),
      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
};

const UpdatePasswordPage = () => {
  const tCommon = useTranslation("common");

  return (
    <Suspense
      fallback={
        <div className={styles["update-password-page"]}>
          <div className={styles["update-password-container"]}>
            <p>{tCommon("loading")}</p>
          </div>
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
  const tCommon = useTranslation("common");

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

  // Create schema with i18n messages
  const updatePasswordFormSchema = useMemo(
    () => createUpdatePasswordFormSchema(t),
    [t]
  );

  type FormData = z.infer<typeof updatePasswordFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(updatePasswordFormSchema),
    mode: "onBlur",
  });

  // Memoize error messages to avoid recreating them on every render
  const errorMessages = useMemo(
    () => ({
      invalidToken: t("errors.invalidToken"),
      passwordResetError: t("errors.passwordResetError"),
      generic: t("errors.generic"),
    }),
    [t]
  );

  useEffect(() => {
    if (updatePasswordMutation.error) {
      const error = updatePasswordMutation.error as {
        message?: string;
        code?: string;
      };

      // Map domain errors
      if (error.code === "INVALID_TOKEN") {
        setError("root", {
          type: "server",
          message: errorMessages.invalidToken,
        });
      } else if (error.code === "PASSWORD_RESET_ERROR") {
        setError("root", {
          type: "server",
          message: errorMessages.passwordResetError,
        });
      } else {
        // General error - set on root
        setError("root", {
          type: "server",
          message: error.message || errorMessages.generic,
        });
      }
    }
  }, [updatePasswordMutation.error, setError, errorMessages]);

  // Redirect to workspace after successful password update
  useEffect(() => {
    if (
      updatePasswordMutation.isSuccess &&
      updatePasswordMutation.data?.session
    ) {
      // Auto-login successful, redirect to workspace
      router.push("/myworkspace");
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

    const updatePasswordInput: UpdatePasswordInput = {
      password: data.password,
      token,
      email: email || "", // Empty string if email not provided (code format)
    };

    updatePasswordMutation.mutate(updatePasswordInput);
  };

  // Show error if token is missing
  // Email is optional (code format doesn't require email in URL)
  if (!token || !isValid) {
    return (
      <div className={styles["update-password-page"]}>
        <div className={styles["update-password-container"]}>
          <h1 className={styles["update-password-title"]}>{t("title")}</h1>
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
        <h1 className={styles["update-password-title"]}>{t("title")}</h1>
        <p className={styles["update-password-subtitle"]}>{t("subtitle")}</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["update-password-form"]}
          noValidate
        >
          {errors.root && (
            <div className={styles["update-password-error"]} role="alert">
              {errors.root.message}
            </div>
          )}

          <Input
            label={t("fields.password")}
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label={t("fields.confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
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
        </form>

        {updatePasswordMutation.isPending && (
          <div
            className={styles["update-password-loading"]}
            role="status"
            aria-live="polite"
          >
            <p>{tCommon("loading")}</p>
          </div>
        )}

        {updatePasswordMutation.isSuccess &&
          updatePasswordMutation.data?.session && (
            <div
              className={styles["update-password-success"]}
              role="status"
              aria-live="polite"
            >
              <p>{t("success")}</p>
              <p>{t("redirecting")}</p>
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
