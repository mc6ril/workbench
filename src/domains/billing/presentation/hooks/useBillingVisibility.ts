import { useQuery } from "@tanstack/react-query";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { billingVisibilityPort } from "@/domains/billing/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/billing/presentation/hooks/queryKeys";

/**
 * Hook that returns runtime billing visibility from remote config.
 */
export const useBillingVisibility = () => {
  return useQuery({
    queryKey: queryKeys.config.billingVisibility(),
    queryFn: () => getBillingVisibility(billingVisibilityPort),
  });
};
