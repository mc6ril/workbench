import { useQuery } from "@tanstack/react-query";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { billingVisibilityPort } from "@/domains/billing/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/billing/presentation/hooks/queryKeys";
import {
  getRuntimeConfigBooleanOverride,
  getRuntimeConfigEvaluationCacheTag,
  readRuntimeConfigBooleanOverridesFromCookieHeader,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";

/**
 * Hook that returns runtime billing visibility from remote config.
 */
export const useBillingVisibility = () => {
  const overrideValue =
    typeof document === "undefined"
      ? undefined
      : getRuntimeConfigBooleanOverride(
          readRuntimeConfigBooleanOverridesFromCookieHeader(document.cookie),
          "is_billing_visible"
        );
  const evaluationTag = getRuntimeConfigEvaluationCacheTag({ overrideValue });

  return useQuery({
    queryKey: queryKeys.config.billingVisibility(evaluationTag),
    queryFn: () =>
      getBillingVisibility(billingVisibilityPort, {
        overrideValue,
      }),
  });
};
