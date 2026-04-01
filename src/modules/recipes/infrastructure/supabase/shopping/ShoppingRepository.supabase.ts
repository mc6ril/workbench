import type { SupabaseClient } from "@supabase/supabase-js";

import { buildShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";

/**
 * Step 2 scaffold:
 * shopping persistence stays opt-in for the next steps, behind a stable contract.
 */
export const createShoppingRepository = (
  _client: SupabaseClient
): ShoppingRepository => ({
  async getShoppingList() {
    return buildShoppingList([]);
  },
});
