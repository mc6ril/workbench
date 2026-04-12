import { useQuery } from "@tanstack/react-query";

import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import {
  getRuntimeConfigBooleanOverride,
  getRuntimeConfigEvaluationCacheTag,
  readRuntimeConfigBooleanOverridesFromCookieHeader,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { runtimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/runtimeConfig/presentation/hooks/queryKeys";

export const useRuntimeConfigBoolean = (key: string, defaultValue: boolean) => {
  const overrideValue =
    typeof document === "undefined"
      ? undefined
      : getRuntimeConfigBooleanOverride(
          readRuntimeConfigBooleanOverridesFromCookieHeader(document.cookie),
          key
        );
  const evaluationTag = getRuntimeConfigEvaluationCacheTag({ overrideValue });

  return useQuery({
    queryKey: queryKeys.runtimeConfig.boolean(key, evaluationTag),
    queryFn: () =>
      getRuntimeConfigBoolean(runtimeConfigPort, {
        key,
        defaultValue,
        overrideValue,
      }),
  });
};
