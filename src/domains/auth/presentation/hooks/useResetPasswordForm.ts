import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/schema/auth.schema";
import { ResetPasswordSchema } from "@/domains/auth/core/domain/schema/auth.schema";

import { useResetPassword } from "@/domains/auth/presentation/hooks/useResetPassword";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { translateFieldError } from "@/shared/i18n/zodFieldErrors";

/**
 * Encapsulates form, validation, mutation, and error handling logic
 * for the reset-password page.
 */
export const useResetPasswordForm = () => {
  const resetPasswordMutation = useResetPassword();
  const tErrors = useTranslation("errors");
  const tFields = useTranslation("pages.resetPassword.fields");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (resetPasswordMutation.error) {
      const error = resetPasswordMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      if (
        error.code === "INVALID_EMAIL" ||
        error.code === "PASSWORD_RESET_ERROR"
      ) {
        setError("email", { type: "server", message: errorMessage });
      } else {
        setError("root", { type: "server", message: errorMessage });
      }
    }
  }, [resetPasswordMutation.error, setError, tErrors]);

  const onSubmit: SubmitHandler<ResetPasswordInput> = useCallback(
    (data) => {
      resetPasswordMutation.mutate(data);
    },
    [resetPasswordMutation]
  );

  return {
    emailField: register("email"),
    onSubmit: handleSubmit(onSubmit),
    emailError: translateFieldError(errors.email, tFields),
    rootError: errors.root?.message,
    isPending: resetPasswordMutation.isPending,
    isSuccess: resetPasswordMutation.isSuccess,
  };
};
