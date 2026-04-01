import type { SupabaseClient } from "@supabase/supabase-js";

import { buildShoppingListFromSources } from "@/modules/recipes/core/domain/shopping/buildShoppingListFromSources";
import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";
import { listShoppingFixtureSources } from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

/**
 * Step 4 foundation:
 * shopping generation now reuses the same ingredient normalization rules as
 * the editor, while keeping provisional data isolated in infrastructure.
 */
export const createShoppingRepository = (
  _client: SupabaseClient
): ShoppingRepository => ({
  async getShoppingList(_projectId) {
    return buildShoppingListFromSources(listShoppingFixtureSources());
  },
});
