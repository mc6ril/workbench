/**
 * Domain port for runtime billing visibility configuration.
 * Implementations must return the current billing visibility flag.
 */
export type BillingVisibilityPort = {
  getBillingVisibility(): Promise<boolean>;
};
