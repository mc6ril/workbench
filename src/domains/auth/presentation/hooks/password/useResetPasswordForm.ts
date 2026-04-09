import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getAppErrorCode } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import type { ResetPasswordInput } from "@/domains/auth/core/domain/auth.types";
import { ResetPasswordSchema } from "@/domains/auth/core/usecases/password/resetPasswordForEmail";
import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";
import { useResetPassword } from "@/domains/auth/presentation/hooks/password/useResetPassword";

export const useResetPasswordForm = () => {
  const resetPasswordMutation = useResetPassword();
  const tErrors = useTranslations("errors");
  const tFields = useTranslations("pages.resetPassword.fields");

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
      const code = getAppErrorCode(resetPasswordMutation.error);
      const errorMessage = getErrorMessage(resetPasswordMutation.error, tErrors);

      if (
        code === AUTH_ERROR_CODE.INVALID_EMAIL ||
        code === AUTH_ERROR_CODE.PASSWORD_RESET_ERROR
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
    emailError: translateAuthFieldError(errors.email, tFields),
    rootError: errors.root?.message,
    isPending: resetPasswordMutation.isPending,
    isSuccess: resetPasswordMutation.isSuccess,
  };
};
