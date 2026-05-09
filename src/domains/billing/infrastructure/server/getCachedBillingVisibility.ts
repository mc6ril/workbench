import "server-only";
import { getCachedRuntimeConfigBoolean } from "@/domains/runtimeConfig/infrastructure/server/getCachedRuntimeConfigBoolean";

export const getCachedBillingVisibility = (): Promise<boolean> =>
  getCachedRuntimeConfigBoolean("is_billing_visible", false);
