import type { BillingVisibilityPort } from "@/domains/billing/core/ports/billingVisibility.port";

/**
 * Returns whether billing surfaces should be visible.
 * Fails closed to `false` to avoid exposing billing flows when config is unavailable.
 */
export const getBillingVisibility = async (
  billingVisibilityPort: BillingVisibilityPort
): Promise<boolean> => {
  try {
    return await billingVisibilityPort.getBillingVisibility();
  } catch {
    return false;
  }
};
