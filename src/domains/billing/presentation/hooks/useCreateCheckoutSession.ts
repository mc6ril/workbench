import { useMutation } from "@tanstack/react-query";

import type { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { createCheckoutSessionClient } from "@/domains/billing/core/usecases/createCheckoutSessionClient";
import { billingSessionsClient } from "@/domains/billing/infrastructure/web/repositories";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (input: { plan: SubscriptionPlan; from?: string }) => {
      return createCheckoutSessionClient(billingSessionsClient, input);
    },
  });
};

