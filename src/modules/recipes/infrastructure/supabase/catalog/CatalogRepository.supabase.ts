import type { SupabaseClient } from "@supabase/supabase-js";

import type { CatalogRepository } from "@/modules/recipes/core/ports/catalog/catalogRepository";

/**
 * Step 2 scaffold:
 * keep the Supabase wiring in place before Recipes tables land.
 */
export const createCatalogRepository = (
  _client: SupabaseClient
): CatalogRepository => ({
  async listByProject() {
    return [];
  },

  async getDetail() {
    return null;
  },
});
