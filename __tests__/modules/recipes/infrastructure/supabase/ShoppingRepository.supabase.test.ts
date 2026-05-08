import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";

const projectId = "project-1";
const shoppingListId = "shopping-list-1";

const shoppingListRow = {
  id: shoppingListId,
  project_id: projectId,
  created_at: "2026-04-01T10:00:00.000Z",
  updated_at: "2026-04-01T10:00:00.000Z",
} as const;

const selections = [
  {
    id: "selection-1",
    project_id: projectId,
    recipe_id: "recipe-1",
    position: 0,
    note: null,
    servings_count: 2,
    servings_label: "2 portions",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "selection-2",
    project_id: projectId,
    recipe_id: "recipe-2",
    position: 1,
    note: null,
    servings_count: 2,
    servings_label: "2 portions",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
  },
] as const;

const recipes = [
  {
    id: "recipe-1",
    title: "Poulet citron",
  },
  {
    id: "recipe-2",
    title: "Bol tofu",
  },
] as const;

const ingredients = [
  {
    id: "ingredient-rice-1",
    project_id: projectId,
    recipe_id: "recipe-1",
    position: 0,
    display_name: "Riz basmati",
    normalized_name: "riz basmati",
    amount_value: 180,
    amount_text: "180",
    unit: "g",
    notes: null,
    kind: "validated",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "ingredient-rice-2",
    project_id: projectId,
    recipe_id: "recipe-2",
    position: 0,
    display_name: "riz basmati",
    normalized_name: "riz basmati",
    amount_value: 220,
    amount_text: "220",
    unit: "g",
    notes: null,
    kind: "validated",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "ingredient-sumac-2",
    project_id: projectId,
    recipe_id: "recipe-2",
    position: 1,
    display_name: "Sumac",
    normalized_name: "sumac",
    amount_value: null,
    amount_text: "au gout",
    unit: null,
    notes: "A tester sur une portion",
    kind: "addition_candidate",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
  },
] as const;

const existingItemRows = [
  {
    id: "persisted-rice-item",
    project_id: projectId,
    shopping_list_id: shoppingListId,
    group_id: "pantry",
    group_title: "Epicerie",
    position: 0,
    display_name: "Riz basmati",
    normalized_name: "riz basmati",
    amount_value: 400,
    amount_text: "400",
    unit: "g",
    notes: null,
    ingredient_kind: "validated",
    checked: true,
    recipe_sources: [
      { recipeId: "recipe-1", title: "Poulet citron" },
      { recipeId: "recipe-2", title: "Bol tofu" },
    ],
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
  },
] as const;

const createClientMock = (
  queues: Partial<
    Record<
      | "shopping_lists"
      | "shopping_list_items"
      | "recipe_selections"
      | "recipes"
      | "recipe_ingredients",
      unknown[]
    >
  >
) => {
  return {
    from: jest.fn(
      (
        table:
          | "shopping_lists"
          | "shopping_list_items"
          | "recipe_selections"
          | "recipes"
          | "recipe_ingredients"
      ) => {
        const nextQuery = queues[table]?.shift();

        if (!nextQuery) {
          throw new Error(`Unexpected query for table ${table}`);
        }

        return nextQuery;
      }
    ),
  } as unknown as AppSupabaseClient;
};

describe("createShoppingRepository", () => {
  it("generates and persists a shopping list from active selections", async () => {
    const single = jest.fn().mockResolvedValue({
      data: shoppingListRow,
      error: null,
    });
    const selectShoppingList = jest.fn().mockReturnValue({ single });
    const upsertShoppingList = jest.fn().mockReturnValue({
      select: selectShoppingList,
    });
    const shoppingListQuery = {
      upsert: upsertShoppingList,
    };
    const existingItemsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(),
    };
    existingItemsQuery.order
      .mockReturnValueOnce(existingItemsQuery)
      .mockResolvedValueOnce({
        data: existingItemRows,
        error: null,
      });
    const selectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: selections,
        error: null,
      }),
    };
    const recipesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: recipes,
        error: null,
      }),
    };
    const ingredientsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn(),
    };
    ingredientsQuery.order
      .mockReturnValueOnce(ingredientsQuery)
      .mockResolvedValueOnce({
        data: ingredients,
        error: null,
      });
    const deleteByList = jest.fn().mockResolvedValue({
      error: null,
    });
    const deleteByProject = jest.fn().mockReturnValue({
      eq: deleteByList,
    });
    const deleteItemsQuery = {
      delete: jest.fn().mockReturnValue({
        eq: deleteByProject,
      }),
    };
    const insert = jest.fn().mockResolvedValue({
      error: null,
    });
    const insertItemsQuery = {
      insert,
    };
    const client = createClientMock({
      shopping_lists: [shoppingListQuery],
      shopping_list_items: [
        existingItemsQuery,
        deleteItemsQuery,
        insertItemsQuery,
      ],
      recipe_selections: [selectionQuery],
      recipes: [recipesQuery],
      recipe_ingredients: [ingredientsQuery],
    });
    const repository = createShoppingRepository(client);

    const shoppingList = await repository.generateShoppingList(projectId);

    expect(upsertShoppingList).toHaveBeenCalledWith(
      {
        project_id: projectId,
      },
      {
        onConflict: "project_id",
      }
    );
    expect(deleteByProject).toHaveBeenCalledWith("project_id", projectId);
    expect(deleteByList).toHaveBeenCalledWith(
      "shopping_list_id",
      shoppingListId
    );
    expect(insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "persisted-rice-item",
          project_id: projectId,
          shopping_list_id: shoppingListId,
          group_id: "pantry",
          group_title: "Epicerie",
          display_name: "Riz basmati",
          normalized_name: "riz basmati",
          amount_value: 400,
          amount_text: "400",
          unit: "g",
          checked: true,
          recipe_sources: [
            { recipeId: "recipe-1", title: "Poulet citron" },
            { recipeId: "recipe-2", title: "Bol tofu" },
          ],
        }),
        expect.objectContaining({
          project_id: projectId,
          shopping_list_id: shoppingListId,
          group_id: "pantry",
          group_title: "Epicerie",
          display_name: "Sumac",
          normalized_name: "sumac",
          amount_value: null,
          amount_text: "au gout",
          unit: null,
          ingredient_kind: "addition_candidate",
          checked: false,
          recipe_sources: [{ recipeId: "recipe-2", title: "Bol tofu" }],
        }),
      ])
    );
    expect(shoppingList.checkedCount).toBe(1);
    expect(shoppingList.pendingCount).toBe(1);
    expect(shoppingList.groups).toHaveLength(1);
  });

  it("updates the checked state of a shopping item", async () => {
    const updateById = jest.fn().mockResolvedValue({
      error: null,
    });
    const updateByProject = jest.fn().mockReturnValue({
      eq: updateById,
    });
    const update = jest.fn().mockReturnValue({
      eq: updateByProject,
    });
    const client = createClientMock({
      shopping_list_items: [
        {
          update,
        },
      ],
    });
    const repository = createShoppingRepository(client);

    await expect(
      repository.setShoppingListItemChecked({
        projectId,
        itemId: "item-1",
        checked: true,
      })
    ).resolves.toBeUndefined();

    expect(update).toHaveBeenCalledWith({
      checked: true,
    });
    expect(updateByProject).toHaveBeenCalledWith("project_id", projectId);
    expect(updateById).toHaveBeenCalledWith("id", "item-1");
  });

  it("clears persisted shopping items when no selection remains active", async () => {
    const single = jest.fn().mockResolvedValue({
      data: shoppingListRow,
      error: null,
    });
    const selectShoppingList = jest.fn().mockReturnValue({ single });
    const upsertShoppingList = jest.fn().mockReturnValue({
      select: selectShoppingList,
    });
    const shoppingListQuery = {
      upsert: upsertShoppingList,
    };
    const existingItemsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(),
    };
    existingItemsQuery.order
      .mockReturnValueOnce(existingItemsQuery)
      .mockResolvedValueOnce({
        data: existingItemRows,
        error: null,
      });
    const selectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const deleteByList = jest.fn().mockResolvedValue({
      error: null,
    });
    const deleteByProject = jest.fn().mockReturnValue({
      eq: deleteByList,
    });
    const deleteItemsQuery = {
      delete: jest.fn().mockReturnValue({
        eq: deleteByProject,
      }),
    };
    const insert = jest.fn();
    const client = createClientMock({
      shopping_lists: [shoppingListQuery],
      shopping_list_items: [existingItemsQuery, deleteItemsQuery, { insert }],
      recipe_selections: [selectionQuery],
    });
    const repository = createShoppingRepository(client);

    const shoppingList = await repository.generateShoppingList(projectId);

    expect(deleteByProject).toHaveBeenCalledWith("project_id", projectId);
    expect(deleteByList).toHaveBeenCalledWith(
      "shopping_list_id",
      shoppingListId
    );
    expect(insert).not.toHaveBeenCalled();
    expect(shoppingList.groups).toEqual([]);
    expect(shoppingList.checkedCount).toBe(0);
    expect(shoppingList.pendingCount).toBe(0);
  });
});
