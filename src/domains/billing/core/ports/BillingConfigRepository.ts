/**
 * Domain port for runtime billing visibility configuration.
 * Implementations must return the current billing visibility flag.
 */
export type BillingConfigRepository = {
  getBillingVisibility(): Promise<boolean>;
};
