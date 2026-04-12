import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import type { RecipeIngredient } from "@/modules/recipes/core/domain/recipe.types";
import {
  buildShoppingIngredientMergeKey,
  buildShoppingListFromSources,
  canMergeShoppingIngredient,
  type ShoppingListIngredientSource,
} from "@/modules/recipes/core/domain/shopping/buildShoppingListFromSources";
import {
  compareShoppingGroupIds,
  resolveShoppingIngredientGroup,
} from "@/modules/recipes/core/domain/shopping/shoppingGrouping";
import {
  buildShoppingList,
  type SetShoppingListItemCheckedInput,
  type ShoppingList,
} from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import type { ShoppingRepository } from "@/modules/recipes/core/ports/shopping/shoppingRepository";
import { mapRecipeIngredientRowToDomain } from "@/modules/recipes/infrastructure/supabase/shared/ingredientMappers";
import type {
  RecipeIngredientRow,
  RecipeRow,
  RecipeSelectionRow,
  ShoppingListItemRow,
  ShoppingListRecipeSourceRow,
  ShoppingListRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import {
  mapShoppingListItemRowToDomain,
  parseShoppingListRecipeSources,
} from "@/modules/recipes/infrastructure/supabase/shared/readModels";

const SHOPPING_LIST_FIELDS = "id, project_id, created_at, updated_at";
const SHOPPING_ITEM_FIELDS =
  "id, project_id, shopping_list_id, group_id, group_title, position, display_name, normalized_name, amount_value, amount_text, unit, notes, ingredient_kind, checked, recipe_sources, created_at, updated_at";
const RECIPE_SELECTION_FIELDS =
  "id, project_id, recipe_id, position, note, servings_count, servings_label, created_at, updated_at";
const RECIPE_TITLE_FIELDS = "id, title";
const RECIPE_INGREDIENT_FIELDS =
  "id, project_id, recipe_id, position, display_name, normalized_name, amount_value, amount_text, unit, notes, kind, created_at, updated_at";

type ShoppingGenerationSource = ShoppingListIngredientSource & {
  selectionPosition: number;
  ingredientPosition: number;
};

const createEmptyShoppingList = (): ShoppingList => {
  return buildShoppingList([]);
};

const buildDistinctPersistedItemKey = (
  groupId: string,
  ingredient: Pick<
    RecipeIngredient,
    "kind" | "normalizedName" | "unit" | "amountText" | "notes"
  >,
  recipes: Array<Pick<ShoppingListRecipeSourceRow, "recipeId">>
): string => {
  const recipeIds = recipes
    .map((recipe) => recipe.recipeId)
    .sort((leftId, rightId) => leftId.localeCompare(rightId))
    .join("|");

  return [
    groupId,
    ingredient.kind,
    ingredient.normalizedName,
    ingredient.unit ?? "",
    ingredient.amountText ?? "",
    ingredient.notes ?? "",
    recipeIds,
  ].join("::");
};

const groupItemsByGroupId = (
  itemRows: ShoppingListItemRow[]
): Map<string, ShoppingListItemRow[]> => {
  const rowsByGroupId = new Map<string, ShoppingListItemRow[]>();

  for (const row of itemRows) {
    const currentGroupRows = rowsByGroupId.get(row.group_id) ?? [];
    currentGroupRows.push(row);
    rowsByGroupId.set(row.group_id, currentGroupRows);
  }

  return rowsByGroupId;
};

const buildCheckedStateLookup = (itemRows: ShoppingListItemRow[]) => {
  const mergeableItemsByKey = new Map<
    string,
    Pick<ShoppingListItemRow, "id" | "checked">
  >();
  const distinctItemsByKey = new Map<
    string,
    Array<Pick<ShoppingListItemRow, "id" | "checked">>
  >();

  for (const row of itemRows) {
    const ingredient = mapShoppingListItemRowToDomain(row).ingredient;

    if (canMergeShoppingIngredient(ingredient)) {
      mergeableItemsByKey.set(
        buildShoppingIngredientMergeKey({
          groupId: row.group_id,
          ingredient,
        }),
        {
          id: row.id,
          checked: row.checked,
        }
      );
      continue;
    }

    const distinctKey = buildDistinctPersistedItemKey(
      row.group_id,
      ingredient,
      parseShoppingListRecipeSources(row.recipe_sources)
    );
    const currentEntries = distinctItemsByKey.get(distinctKey) ?? [];

    currentEntries.push({
      id: row.id,
      checked: row.checked,
    });
    distinctItemsByKey.set(distinctKey, currentEntries);
  }

  return {
    mergeableItemsByKey,
    distinctItemsByKey,
  };
};

const applyPersistedCheckedState = (
  shoppingList: ShoppingList,
  existingItemRows: ShoppingListItemRow[]
): ShoppingList => {
  const { mergeableItemsByKey, distinctItemsByKey } =
    buildCheckedStateLookup(existingItemRows);

  return buildShoppingList(
    shoppingList.groups.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (canMergeShoppingIngredient(item.ingredient)) {
          const existingItem = mergeableItemsByKey.get(
            buildShoppingIngredientMergeKey({
              groupId: group.id,
              ingredient: item.ingredient,
            })
          );

          if (existingItem) {
            return {
              ...item,
              id: existingItem.id,
              checked: existingItem.checked,
            };
          }

          return {
            ...item,
            id: crypto.randomUUID(),
          };
        }

        const distinctKey = buildDistinctPersistedItemKey(
          group.id,
          item.ingredient,
          item.recipes
        );
        const currentEntries = distinctItemsByKey.get(distinctKey) ?? [];
        const existingItem = currentEntries.shift();

        if (existingItem) {
          distinctItemsByKey.set(distinctKey, currentEntries);
          return {
            ...item,
            id: existingItem.id,
            checked: existingItem.checked,
          };
        }

        return {
          ...item,
          id: crypto.randomUUID(),
        };
      }),
    }))
  );
};

const mapItemRowsToShoppingList = (itemRows: ShoppingListItemRow[]): ShoppingList => {
  if (itemRows.length === 0) {
    return createEmptyShoppingList();
  }

  const rowsByGroupId = groupItemsByGroupId(itemRows);
  const orderedGroups = [...rowsByGroupId.values()]
    .map((groupRows) => ({
      id: groupRows[0].group_id,
      title: groupRows[0].group_title,
      items: groupRows.map((row) => mapShoppingListItemRowToDomain(row)),
    }))
    .sort((leftGroup, rightGroup) =>
      compareShoppingGroupIds(leftGroup.id, rightGroup.id)
    );

  return buildShoppingList(orderedGroups);
};

const loadOrCreateShoppingListRow = async (
  client: SupabaseClient,
  projectId: string
): Promise<ShoppingListRow> => {
  const { data, error } = await client
    .from("shopping_lists")
    .upsert(
      {
        project_id: projectId,
      },
      {
        onConflict: "project_id",
      }
    )
    .select(SHOPPING_LIST_FIELDS)
    .single();

  if (error) {
    return handleRepositoryError(error, "ShoppingList", projectId);
  }

  return data as ShoppingListRow;
};

const loadShoppingItemRows = async (
  client: SupabaseClient,
  projectId: string,
  shoppingListId: string
): Promise<ShoppingListItemRow[]> => {
  const { data, error } = await client
    .from("shopping_list_items")
    .select(SHOPPING_ITEM_FIELDS)
    .eq("project_id", projectId)
    .eq("shopping_list_id", shoppingListId)
    .order("group_id", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    return handleRepositoryError(error, "ShoppingListItem", projectId);
  }

  return (data ?? []) as ShoppingListItemRow[];
};

const loadSelectionRows = async (
  client: SupabaseClient,
  projectId: string
): Promise<RecipeSelectionRow[]> => {
  const { data, error } = await client
    .from("recipe_selections")
    .select(RECIPE_SELECTION_FIELDS)
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    return handleRepositoryError(error, "RecipeSelection", projectId);
  }

  return (data ?? []) as RecipeSelectionRow[];
};

const loadRecipeTitlesByIds = async (
  client: SupabaseClient,
  projectId: string,
  recipeIds: string[]
): Promise<Map<string, Pick<RecipeRow, "id" | "title">>> => {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("recipes")
    .select(RECIPE_TITLE_FIELDS)
    .eq("project_id", projectId)
    .in("id", recipeIds);

  if (error) {
    return handleRepositoryError(error, "Recipe", projectId);
  }

  return new Map(
    ((data ?? []) as Array<Pick<RecipeRow, "id" | "title">>).map((recipe) => [
      recipe.id,
      recipe,
    ])
  );
};

const loadIngredientRowsByRecipeIds = async (
  client: SupabaseClient,
  projectId: string,
  recipeIds: string[]
): Promise<Map<string, RecipeIngredientRow[]>> => {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("recipe_ingredients")
    .select(RECIPE_INGREDIENT_FIELDS)
    .eq("project_id", projectId)
    .in("recipe_id", recipeIds)
    .order("recipe_id", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    return handleRepositoryError(error, "RecipeIngredient", projectId);
  }

  const ingredientsByRecipeId = new Map<string, RecipeIngredientRow[]>();

  for (const row of (data ?? []) as RecipeIngredientRow[]) {
    const recipeIngredients = ingredientsByRecipeId.get(row.recipe_id) ?? [];
    recipeIngredients.push(row);
    ingredientsByRecipeId.set(row.recipe_id, recipeIngredients);
  }

  return ingredientsByRecipeId;
};

const buildSourcesFromSelections = (
  selections: RecipeSelectionRow[],
  recipesById: Map<string, Pick<RecipeRow, "id" | "title">>,
  ingredientsByRecipeId: Map<string, RecipeIngredientRow[]>
): ShoppingGenerationSource[] => {
  return selections
    .flatMap((selection) => {
      const recipe = recipesById.get(selection.recipe_id);

      if (!recipe) {
        return [];
      }

      const ingredientRows = ingredientsByRecipeId.get(selection.recipe_id) ?? [];

      return ingredientRows.map((ingredientRow) => {
        const ingredient = mapRecipeIngredientRowToDomain(ingredientRow);
        const group = resolveShoppingIngredientGroup(ingredient);

        return {
          id: `${selection.id}:${ingredientRow.id}`,
          groupId: group.id,
          groupTitle: group.title,
          ingredient,
          recipe: {
            recipeId: recipe.id,
            title: recipe.title,
          },
          selectionPosition: selection.position,
          ingredientPosition: ingredientRow.position,
        };
      });
    })
    .sort((leftSource, rightSource) => {
      if (leftSource.groupId !== rightSource.groupId) {
        return compareShoppingGroupIds(leftSource.groupId, rightSource.groupId);
      }

      if (leftSource.selectionPosition !== rightSource.selectionPosition) {
        return leftSource.selectionPosition - rightSource.selectionPosition;
      }

      return leftSource.ingredientPosition - rightSource.ingredientPosition;
    });
};

const persistShoppingListItems = async (
  client: SupabaseClient,
  projectId: string,
  shoppingListId: string,
  shoppingList: ShoppingList
) => {
  const { error: deleteError } = await client
    .from("shopping_list_items")
    .delete()
    .eq("project_id", projectId)
    .eq("shopping_list_id", shoppingListId);

  if (deleteError) {
    return handleRepositoryError(deleteError, "ShoppingListItem", projectId);
  }

  const rowsToInsert = shoppingList.groups.flatMap((group) =>
    group.items.map((item, position) => ({
      id: item.id,
      project_id: projectId,
      shopping_list_id: shoppingListId,
      group_id: group.id,
      group_title: group.title,
      position,
      display_name: item.ingredient.displayName,
      normalized_name: item.ingredient.normalizedName,
      amount_value: item.ingredient.amountValue,
      amount_text: item.ingredient.amountText,
      unit: item.ingredient.unit,
      notes: item.ingredient.notes,
      ingredient_kind: item.ingredient.kind,
      checked: item.checked,
      recipe_sources: item.recipes,
    }))
  );

  if (rowsToInsert.length === 0) {
    return;
  }

  const { error: insertError } = await client
    .from("shopping_list_items")
    .insert(rowsToInsert);

  if (insertError) {
    return handleRepositoryError(insertError, "ShoppingListItem", projectId);
  }
};

const generateAndPersistShoppingList = async (
  client: SupabaseClient,
  projectId: string
): Promise<ShoppingList> => {
  const shoppingListRow = await loadOrCreateShoppingListRow(client, projectId);
  const existingItemRows = await loadShoppingItemRows(
    client,
    projectId,
    shoppingListRow.id
  );
  const selections = await loadSelectionRows(client, projectId);

  if (selections.length === 0) {
    const emptyShoppingList = createEmptyShoppingList();

    await persistShoppingListItems(
      client,
      projectId,
      shoppingListRow.id,
      emptyShoppingList
    );

    return emptyShoppingList;
  }

  const recipeIds = [...new Set(selections.map((selection) => selection.recipe_id))];
  const [recipesById, ingredientsByRecipeId] = await Promise.all([
    loadRecipeTitlesByIds(client, projectId, recipeIds),
    loadIngredientRowsByRecipeIds(client, projectId, recipeIds),
  ]);
  const sources = buildSourcesFromSelections(
    selections,
    recipesById,
    ingredientsByRecipeId
  );
  const generatedShoppingList = applyPersistedCheckedState(
    buildShoppingListFromSources(sources),
    existingItemRows
  );

  await persistShoppingListItems(
    client,
    projectId,
    shoppingListRow.id,
    generatedShoppingList
  );

  return generatedShoppingList;
};

export const createShoppingRepository = (
  client: SupabaseClient
): ShoppingRepository => ({
  async getShoppingList(projectId) {
    const { data: shoppingListData, error: shoppingListError } = await client
      .from("shopping_lists")
      .select(SHOPPING_LIST_FIELDS)
      .eq("project_id", projectId)
      .maybeSingle();

    if (shoppingListError) {
      return handleRepositoryError(shoppingListError, "ShoppingList", projectId);
    }

    const shoppingList = shoppingListData as ShoppingListRow | null;

    if (!shoppingList) {
      return createEmptyShoppingList();
    }

    const itemRows = await loadShoppingItemRows(client, projectId, shoppingList.id);
    return mapItemRowsToShoppingList(itemRows);
  },

  async generateShoppingList(projectId) {
    return generateAndPersistShoppingList(client, projectId);
  },

  async setShoppingListItemChecked(input: SetShoppingListItemCheckedInput) {
    const { error } = await client
      .from("shopping_list_items")
      .update({
        checked: input.checked,
      })
      .eq("project_id", input.projectId)
      .eq("id", input.itemId);

    if (error) {
      return handleRepositoryError(error, "ShoppingListItem", input.itemId);
    }
  },
});
