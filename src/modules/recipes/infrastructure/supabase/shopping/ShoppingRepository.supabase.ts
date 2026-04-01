import type { SupabaseClient } from "@supabase/supabase-js";

import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";

/**
 * Step 2 scaffold:
 * shopping persistence stays opt-in for the next steps, behind a stable contract.
 */
export const createShoppingRepository = (
  _client: SupabaseClient
): ShoppingRepository => ({
  async getShoppingList() {
    return {
      groups: [],
      checkedCount: 0,
      pendingCount: 0,
    };
  },
});
