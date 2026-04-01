import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { buildShoppingListFromSources } from "@/modules/recipes/core/domain/shopping/buildShoppingListFromSources";
import { buildShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";
import type {
  ShoppingListItemRow,
  ShoppingListRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import { mapShoppingListItemRowToDomain } from "@/modules/recipes/infrastructure/supabase/shared/readModels";
import { listShoppingFixtureSources } from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

/**
 * Step 5:
 * read the persisted shopping projection when present. The former generated
 * fixture remains as a temporary fallback until selection mutations land.
 */
export const createShoppingRepository = (
  client: SupabaseClient
): ShoppingRepository => ({
  async getShoppingList(projectId) {
    const { data: shoppingListData, error: shoppingListError } = await client
      .from("shopping_lists")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (shoppingListError) {
      return handleRepositoryError(shoppingListError, "ShoppingList", projectId);
    }

    const shoppingList = shoppingListData as ShoppingListRow | null;

    if (!shoppingList) {
      return buildShoppingListFromSources(listShoppingFixtureSources());
    }

    const { data: itemData, error: itemError } = await client
      .from("shopping_list_items")
      .select("*")
      .eq("project_id", projectId)
      .eq("shopping_list_id", shoppingList.id)
      .order("group_title", { ascending: true })
      .order("position", { ascending: true });

    if (itemError) {
      return handleRepositoryError(itemError, "ShoppingListItem", projectId);
    }

    const groupsById = new Map<
      string,
      {
        id: string;
        title: string;
        items: ReturnType<typeof mapShoppingListItemRowToDomain>[];
      }
    >();

    for (const item of (itemData ?? []) as ShoppingListItemRow[]) {
      const existingGroup = groupsById.get(item.group_id);

      if (existingGroup) {
        existingGroup.items.push(mapShoppingListItemRowToDomain(item));
        continue;
      }

      groupsById.set(item.group_id, {
        id: item.group_id,
        title: item.group_title,
        items: [mapShoppingListItemRowToDomain(item)],
      });
    }

    return buildShoppingList(Array.from(groupsById.values()));
  },
});
