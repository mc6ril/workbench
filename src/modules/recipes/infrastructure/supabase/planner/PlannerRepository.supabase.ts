import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlannerRepository } from "@/modules/recipes/core/ports/planner/plannerRepository";

/**
 * Step 2 scaffold:
 * quick-list persistence is intentionally deferred, but the repository seam is ready.
 */
export const createPlannerRepository = (
  _client: SupabaseClient
): PlannerRepository => ({
  async listQuickList() {
    return [];
  },
});
