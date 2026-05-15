import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";

const recipe = {
  id: "recipe-1",
  project_id: "project-1",
  title: "Poulet citron",
  summary: "Simple et rapide.",
  total_time_minutes: 25,
  total_time_label: "25 min",
  servings_count: 4,
  servings_label: "4 portions",
  note: null,
  cover_image_url: null,
  cover_style: "citrus",
  created_at: "2026-04-01T10:00:00.000Z",
  updated_at: "2026-04-01T10:00:00.000Z",
} as const;

const selection = {
  id: "selection-1",
  project_id: "project-1",
  recipe_id: "recipe-1",
  position: 0,
  note: "Mardi soir.",
  servings_count: 4,
  servings_label: "4 portions",
  status: "pending",
  created_at: "2026-04-01T10:00:00.000Z",
  updated_at: "2026-04-01T10:00:00.000Z",
} as const;

const createClientMock = (
  queues: Partial<
    Record<
      "recipe_selections" | "recipes" | "recipe_cooking_history",
      unknown[]
    >
  >
) => {
  return {
    from: jest.fn(
      (table: "recipe_selections" | "recipes" | "recipe_cooking_history") => {
        const nextQuery = queues[table]?.shift();

        if (!nextQuery) {
          throw new Error(`Unexpected query for table ${table}`);
        }

        return nextQuery;
      }
    ),
  } as unknown as AppSupabaseClient;
};

describe("createPlannerRepository", () => {
  it("lists active selections from persisted recipe_selections", async () => {
    const selectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [selection],
        error: null,
      }),
    };
    const recipesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: [recipe],
        error: null,
      }),
    };
    const client = createClientMock({
      recipe_selections: [selectionQuery],
      recipes: [recipesQuery],
    });
    const repository = createPlannerRepository(client);

    await expect(repository.listActiveSelections("project-1")).resolves.toEqual(
      [
        {
          id: "selection-1",
          recipeId: "recipe-1",
          title: "Poulet citron",
          note: "Mardi soir.",
          servingsCount: 4,
          servingsLabel: "4 portions",
          status: "pending",
        },
      ]
    );
  });

  it("selects a recipe with the next planner position", async () => {
    const existingSelectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };
    const recipeQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: recipe,
        error: null,
      }),
    };
    const positionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [{ position: 2 }],
        error: null,
      }),
    };
    const single = jest.fn().mockResolvedValue({
      data: {
        ...selection,
        position: 3,
      },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const insertQuery = {
      insert,
    };
    const client = createClientMock({
      recipe_selections: [existingSelectionQuery, positionQuery, insertQuery],
      recipes: [recipeQuery],
    });
    const repository = createPlannerRepository(client);

    await expect(
      repository.selectRecipe({
        projectId: "project-1",
        recipeId: "recipe-1",
      })
    ).resolves.toEqual({
      id: "selection-1",
      recipeId: "recipe-1",
      title: "Poulet citron",
      note: "Mardi soir.",
      servingsCount: 4,
      servingsLabel: "4 portions",
      status: "pending",
    });

    expect(insert).toHaveBeenCalledWith({
      project_id: "project-1",
      recipe_id: "recipe-1",
      position: 3,
      note: null,
      servings_count: 4,
      servings_label: "4 portions",
      status: "pending",
    });
  });

  it("reuses an existing pending selection instead of inserting a duplicate", async () => {
    const existingSelectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: selection,
        error: null,
      }),
    };
    const recipeQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: recipe,
        error: null,
      }),
    };
    const client = createClientMock({
      recipe_selections: [existingSelectionQuery],
      recipes: [recipeQuery],
    });
    const repository = createPlannerRepository(client);

    await expect(
      repository.selectRecipe({
        projectId: "project-1",
        recipeId: "recipe-1",
      })
    ).resolves.toEqual({
      id: "selection-1",
      recipeId: "recipe-1",
      title: "Poulet citron",
      note: "Mardi soir.",
      servingsCount: 4,
      servingsLabel: "4 portions",
      status: "pending",
    });
  });

  it("resets a shopping_done selection back to pending on re-select", async () => {
    const shoppingDoneSelection = { ...selection, status: "shopping_done" };
    const existingSelectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: shoppingDoneSelection,
        error: null,
      }),
    };
    const recipeQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: recipe,
        error: null,
      }),
    };
    const single = jest
      .fn()
      .mockResolvedValue({ data: selection, error: null });
    const selectFn = jest.fn().mockReturnValue({ single });
    const updateQuery = {
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        select: selectFn,
      }),
    };
    const client = createClientMock({
      recipe_selections: [existingSelectionQuery, updateQuery],
      recipes: [recipeQuery],
    });
    const repository = createPlannerRepository(client);

    const result = await repository.selectRecipe({
      projectId: "project-1",
      recipeId: "recipe-1",
    });

    expect(result.status).toBe("pending");
  });

  it("marks a selection as shopping_done by updating the status", async () => {
    const single = jest.fn().mockResolvedValue({
      data: { ...selection, status: "shopping_done" },
      error: null,
    });
    const selectFn = jest.fn().mockReturnValue({ single });
    const updateQuery = {
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        select: selectFn,
      }),
    };
    const recipeQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: recipe,
        error: null,
      }),
    };
    const client = createClientMock({
      recipe_selections: [updateQuery],
      recipes: [recipeQuery],
    });
    const repository = createPlannerRepository(client);

    await expect(
      repository.markShoppingDone({
        projectId: "project-1",
        selectionId: "selection-1",
      })
    ).resolves.toMatchObject({
      id: "selection-1",
      status: "shopping_done",
    });
  });

  it("marks a selection as cooked by deleting it and recording cooking history", async () => {
    const selectionQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: selection,
        error: null,
      }),
    };
    const recipeQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: recipe,
        error: null,
      }),
    };
    const deleteById = jest.fn().mockResolvedValue({ error: null });
    const deleteByProject = jest.fn().mockReturnValue({ eq: deleteById });
    const deleteQuery = {
      delete: jest.fn().mockReturnValue({ eq: deleteByProject }),
    };
    const historyInsertQuery = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };
    const client = createClientMock({
      recipe_selections: [selectionQuery, deleteQuery],
      recipes: [recipeQuery],
      recipe_cooking_history: [historyInsertQuery],
    });
    const repository = createPlannerRepository(client);

    await expect(
      repository.markAsCooked({
        projectId: "project-1",
        selectionId: "selection-1",
      })
    ).resolves.toEqual({
      selectionId: "selection-1",
      recipeId: "recipe-1",
      title: "Poulet citron",
    });

    expect(historyInsertQuery.insert).toHaveBeenCalledWith({
      project_id: "project-1",
      recipe_id: "recipe-1",
    });
  });

  it("removes a selection without touching the recipe catalog", async () => {
    const deleteById = jest.fn().mockResolvedValue({ error: null });
    const deleteByProject = jest.fn().mockReturnValue({ eq: deleteById });
    const deleteQuery = {
      delete: jest.fn().mockReturnValue({ eq: deleteByProject }),
    };
    const client = createClientMock({
      recipe_selections: [deleteQuery],
    });
    const repository = createPlannerRepository(client);

    await expect(
      repository.removeSelection({
        projectId: "project-1",
        selectionId: "selection-1",
      })
    ).resolves.toBeUndefined();

    expect(deleteByProject).toHaveBeenCalledWith("project_id", "project-1");
    expect(deleteById).toHaveBeenCalledWith("id", "selection-1");
  });
});
