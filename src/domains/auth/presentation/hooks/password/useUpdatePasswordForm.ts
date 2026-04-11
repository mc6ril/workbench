import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import { translateAuthFieldError } from "@/domains/auth/presentation/forms/authFieldErrors";
import type { UpdatePasswordFormInput } from "@/domains/auth/presentation/forms/authForms.schema";
import { UpdatePasswordFormSchema } from "@/domains/auth/presentation/forms/authForms.schema";
import { useUpdatePassword } from "@/domains/auth/presentation/hooks/password/useUpdatePassword";
import { getNextUnmetCriterion } from "@/domains/auth/presentation/password/passwordStrength";

export const useUpdatePasswordForm = () => {
  const router = useAppRouter();
  const updatePasswordMutation = useUpdatePassword();
  const tErrors = useTranslations("errors");
  const tFields = useTranslations("pages.updatePassword.fields");

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
      setError("root", {
        type: "server",
        message: getErrorMessage(updatePasswordMutation.error, tErrors),
      });
    }
  }, [updatePasswordMutation.error, setError, tErrors]);

  useEffect(() => {
    if (
      updatePasswordMutation.isSuccess &&
      updatePasswordMutation.data?.session
    ) {
      router.push(PAGE_ROUTES.WORKSPACE);
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
    passwordError: translateAuthFieldError(errors.password, tFields),
    confirmPasswordError: translateAuthFieldError(
      errors.confirmPassword,
      tFields
    ),
    rootError: errors.root?.message,
    isPending: updatePasswordMutation.isPending,
    isSuccess:
      updatePasswordMutation.isSuccess &&
      !!updatePasswordMutation.data?.session,
  };
};
