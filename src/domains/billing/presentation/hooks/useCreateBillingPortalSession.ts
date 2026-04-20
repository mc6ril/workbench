import { useMutation } from "@tanstack/react-query";

import { createBillingPortalSessionClient } from "@/domains/billing/core/usecases/createBillingPortalSessionClient";
import { billingSessionsClient } from "@/domains/billing/infrastructure/web/repositories";

export const useCreateBillingPortalSession = () => {
  return useMutation({
    mutationFn: async (input: { from?: string }) => {
      return createBillingPortalSessionClient(billingSessionsClient, input);
    },
  });
};
