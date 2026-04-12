import type { BillingVisibilityPort } from "@/domains/billing/core/ports/billingVisibility.port";

type GetBillingVisibilityInput = {
  overrideValue?: boolean;
};

/**
 * Returns whether billing surfaces should be visible.
 * Fails closed to `false` to avoid exposing billing flows when config is unavailable.
 */
export const getBillingVisibility = async (
  billingVisibilityPort: BillingVisibilityPort,
  input?: GetBillingVisibilityInput
): Promise<boolean> => {
  if (typeof input?.overrideValue === "boolean") {
    return input.overrideValue;
  }

  try {
    return await billingVisibilityPort.getBillingVisibility();
  } catch {
    return false;
  }
};
