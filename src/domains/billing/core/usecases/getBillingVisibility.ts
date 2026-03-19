import type { BillingConfigRepository } from "@/domains/billing/core/ports/BillingConfigRepository";

/**
 * Returns whether billing surfaces should be visible.
 * Fails closed to `false` to avoid exposing billing flows when config is unavailable.
 */
export const getBillingVisibility = async (
  billingConfigRepository: BillingConfigRepository
): Promise<boolean> => {
  try {
    return await billingConfigRepository.getBillingVisibility();
  } catch {
    return false;
  }
};
