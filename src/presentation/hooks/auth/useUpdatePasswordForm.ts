import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { getNextUnmetCriterion } from "@/core/domain/passwordStrength";
import type { UpdatePasswordFormInput } from "@/core/domain/schema/auth.schema";
import { UpdatePasswordFormSchema } from "@/core/domain/schema/auth.schema";

import { useUpdatePassword } from "@/presentation/hooks/auth/useUpdatePassword";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { translateFieldError } from "@/shared/i18n/zodFieldErrors";

/**
 * Encapsulates all form, validation, mutation, error handling,
 * and password strength logic for the update-password page.
 */
export const useUpdatePasswordForm = () => {
  const router = useRouter();
  const updatePasswordMutation = useUpdatePassword();
  const tErrors = useTranslation("errors");
  const tFields = useTranslation("pages.updatePassword.fields");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<UpdatePasswordFormInput>({
    resolver: zodResolver(UpdatePasswordFormSchema),
    mode: "onBlur",
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const nextCriterion = getNextUnmetCriterion(passwordValue);
  const passwordHint = nextCriterion
    ? tFields(`password.hint.${nextCriterion}`)
    : undefined;

  useEffect(() => {
    if (updatePasswordMutation.error) {
      const error = updatePasswordMutation.error as { code?: string };
      setError("root", {
        type: "server",
        message: getErrorMessage(error, tErrors),
      });
    }
  }, [updatePasswordMutation.error, setError, tErrors]);

  useEffect(() => {
    if (
      updatePasswordMutation.isSuccess &&
      updatePasswordMutation.data?.session
    ) {
      router.push("/workspace");
    }
  }, [updatePasswordMutation.isSuccess, updatePasswordMutation.data, router]);

  const onSubmit: SubmitHandler<UpdatePasswordFormInput> = useCallback(
    (data) => {
      updatePasswordMutation.mutate({ password: data.password });
    },
    [updatePasswordMutation]
  );

  return {
    passwordField: register("password"),
    confirmPasswordField: register("confirmPassword"),
    onSubmit: handleSubmit(onSubmit),
    passwordValue,
    passwordHint,
    passwordError: translateFieldError(errors.password, tFields),
    confirmPasswordError: translateFieldError(errors.confirmPassword, tFields),
    rootError: errors.root?.message,
    isPending: updatePasswordMutation.isPending,
    isSuccess:
      updatePasswordMutation.isSuccess &&
      !!updatePasswordMutation.data?.session,
  };
};
