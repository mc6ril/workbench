import type { SupabaseClient } from "@supabase/supabase-js";

import { createQueryBuilderMock } from "../../../../infrastructure/supabase/testUtils/queryBuilderMock";

import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { createEditorRepository } from "@/modules/recipes/infrastructure/supabase/editor/EditorRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import type {
  RecipeIngredientRow,
  RecipeRow,
  RecipeSelectionRow,
  RecipeStepRow,
  RecipeTagLinkRow,
  RecipeTagRow,
  ShoppingListItemRow,
  ShoppingListRow,
} from "@/modules/recipes/infrastructure/supabase/shared/persistence.types";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";

describe("Recipes Supabase repositories", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const recipeId = "323e4567-e89b-12d3-a456-426614174000";
  const selectionId = "423e4567-e89b-12d3-a456-426614174000";
  const tagId = "523e4567-e89b-12d3-a456-426614174000";
  const secondTagId = "533e4567-e89b-12d3-a456-426614174000";
  const shoppingListId = "623e4567-e89b-12d3-a456-426614174000";

  const recipeRow: RecipeRow = {
    id: recipeId,
    project_id: projectId,
    title: "Poulet citron & riz pilaf",
    summary: "Recette persistée pour la lecture détail.",
    total_time_minutes: 35,
    total_time_label: "35 min",
    servings_count: 2,
    servings_label: "2 portions",
    note: "Le sumac reste à confirmer.",
    cover_image_url: null,
    cover_style: "citrus",
    created_at: "2026-03-31T08:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z",
  };

  const selectionRow: RecipeSelectionRow = {
    id: selectionId,
    project_id: projectId,
    recipe_id: recipeId,
    position: 0,
    note: "Mardi soir",
    servings_count: 2,
    servings_label: "2 portions",
    created_at: "2026-03-31T08:05:00.000Z",
    updated_at: "2026-03-31T08:05:00.000Z",
  };

  const ingredientRow: RecipeIngredientRow = {
    id: "723e4567-e89b-12d3-a456-426614174000",
    project_id: projectId,
    recipe_id: recipeId,
    position: 1,
    display_name: "citron jaune",
    normalized_name: "citron jaune",
    amount_value: 1,
    amount_text: "1",
    unit: "piece",
    notes: "zeste + jus",
    kind: "validated",
    created_at: "2026-03-31T08:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z",
  };

  const stepRow: RecipeStepRow = {
    id: "823e4567-e89b-12d3-a456-426614174000",
    project_id: projectId,
    recipe_id: recipeId,
    position: 1,
    title: null,
    instruction: "Rincer le riz puis lancer la cuisson.",
    notes: null,
    meta: "Base",
    created_at: "2026-03-31T08:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z",
  };

  const tagRow: RecipeTagRow = {
    id: tagId,
    project_id: projectId,
    label: "Rapide",
    slug: "rapide",
    created_at: "2026-03-31T08:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z",
  };

  const secondTagRow: RecipeTagRow = {
    id: secondTagId,
    project_id: projectId,
    label: "Poulet",
    slug: "poulet",
    created_at: "2026-03-31T08:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z",
  };

  const tagLinkRow: RecipeTagLinkRow = {
    project_id: projectId,
    recipe_id: recipeId,
    tag_id: tagId,
    created_at: "2026-03-31T08:00:00.000Z",
  };

  const secondTagLinkRow: RecipeTagLinkRow = {
    project_id: projectId,
    recipe_id: recipeId,
    tag_id: secondTagId,
    created_at: "2026-03-31T08:00:00.000Z",
  };

  const shoppingListRow: ShoppingListRow = {
    id: shoppingListId,
    project_id: projectId,
    created_at: "2026-03-31T08:00:00.000Z",
    updated_at: "2026-03-31T08:00:00.000Z",
  };

  const shoppingItemRows: ShoppingListItemRow[] = [
    {
      id: "923e4567-e89b-12d3-a456-426614174000",
      project_id: projectId,
      shopping_list_id: shoppingListId,
      group_id: "primeur",
      group_title: "Primeur",
      position: 0,
      display_name: "citron jaune",
      normalized_name: "citron jaune",
      amount_value: 1,
      amount_text: "1",
      unit: "piece",
      notes: null,
      ingredient_kind: "validated",
      checked: false,
      recipe_sources: [{ recipeId, title: recipeRow.title }],
      created_at: "2026-03-31T08:00:00.000Z",
      updated_at: "2026-03-31T08:00:00.000Z",
    },
    {
      id: "a23e4567-e89b-12d3-a456-426614174000",
      project_id: projectId,
      shopping_list_id: shoppingListId,
      group_id: "epicerie",
      group_title: "Epicerie",
      position: 0,
      display_name: "sumac",
      normalized_name: "sumac",
      amount_value: null,
      amount_text: "au gout",
      unit: null,
      notes: "ajout a tester",
      ingredient_kind: "addition_candidate",
      checked: true,
      recipe_sources: [{ recipeId, title: recipeRow.title }],
      created_at: "2026-03-31T08:00:00.000Z",
      updated_at: "2026-03-31T08:00:00.000Z",
    },
  ];

  const createClient = (
    builders: Record<string, unknown | unknown[]>
  ): SupabaseClient => {
    const callsByTable = new Map<string, number>();

    return {
      from: jest.fn((table: string) => {
        const configuredBuilder = builders[table];

        if (!configuredBuilder) {
          throw new Error(`Unexpected table query in test: ${table}`);
        }

        if (Array.isArray(configuredBuilder)) {
          const currentCallCount = callsByTable.get(table) ?? 0;
          const builder = configuredBuilder[currentCallCount];

          if (!builder) {
            throw new Error(`Missing builder for ${table} call #${currentCallCount + 1}`);
          }

          callsByTable.set(table, currentCallCount + 1);
          return builder;
        }

        const builder = configuredBuilder;
        return builder;
      }),
    } as unknown as SupabaseClient;
  };

  it("loads a persisted recipe draft with ingredients, steps, and tags", async () => {
    const recipeQuery = createQueryBuilderMock<RecipeRow[]>([recipeRow]);
    const ingredientQuery = createQueryBuilderMock<RecipeIngredientRow[]>([
      ingredientRow,
    ]);
    const stepQuery = createQueryBuilderMock<RecipeStepRow[]>([stepRow]);
    const tagLinkQuery = createQueryBuilderMock<RecipeTagLinkRow[]>([tagLinkRow]);
    const tagQuery = createQueryBuilderMock<RecipeTagRow[]>([tagRow]);
    const client = createClient({
      recipes: recipeQuery,
      recipe_ingredients: ingredientQuery,
      recipe_steps: stepQuery,
      recipe_tag_links: tagLinkQuery,
      recipe_tags: tagQuery,
    });

    const repository = createEditorRepository(client);
    const draft = await repository.getDraft(projectId, recipeId);

    expect(recipeQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(recipeQuery.in).toHaveBeenCalledWith("id", [recipeId]);
    expect(ingredientQuery.in).toHaveBeenCalledWith("recipe_id", [recipeId]);
    expect(stepQuery.in).toHaveBeenCalledWith("recipe_id", [recipeId]);
    expect(tagLinkQuery.in).toHaveBeenCalledWith("recipe_id", [recipeId]);
    expect(tagQuery.in).toHaveBeenCalledWith("id", [tagId]);
    expect(draft?.title).toBe(recipeRow.title);
    expect(draft?.ingredients[0]?.displayName).toBe(ingredientRow.display_name);
    expect(draft?.steps[0]?.instruction).toBe(stepRow.instruction);
    expect(draft?.tags[0]?.label).toBe(tagRow.label);
  });

  it("marks catalog detail recipes as part of the quick list when selected", async () => {
    const recipeQuery = createQueryBuilderMock<RecipeRow[]>([recipeRow]);
    const ingredientQuery = createQueryBuilderMock<RecipeIngredientRow[]>([
      ingredientRow,
    ]);
    const stepQuery = createQueryBuilderMock<RecipeStepRow[]>([stepRow]);
    const tagLinkQuery = createQueryBuilderMock<RecipeTagLinkRow[]>([tagLinkRow]);
    const tagQuery = createQueryBuilderMock<RecipeTagRow[]>([tagRow]);
    const selectionQuery = createQueryBuilderMock<{ id: string } | null>({
      id: selectionId,
    });
    const client = createClient({
      recipes: recipeQuery,
      recipe_ingredients: ingredientQuery,
      recipe_steps: stepQuery,
      recipe_tag_links: tagLinkQuery,
      recipe_tags: tagQuery,
      recipe_selections: selectionQuery,
    });

    const repository = createCatalogRepository(client);
    const detail = await repository.getDetail(projectId, recipeId);

    expect(selectionQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(selectionQuery.eq).toHaveBeenCalledWith("recipe_id", recipeId);
    expect(detail?.isInQuickList).toBe(true);
    expect(detail?.ingredients[0]?.displayName).toBe(ingredientRow.display_name);
  });

  it("lists persisted quick list selections in project order", async () => {
    const selectionQuery = createQueryBuilderMock<RecipeSelectionRow[]>([
      selectionRow,
    ]);
    const recipeQuery = createQueryBuilderMock<RecipeRow[]>([recipeRow]);
    const client = createClient({
      recipe_selections: selectionQuery,
      recipes: recipeQuery,
    });

    const repository = createPlannerRepository(client);
    const selections = await repository.listActiveSelections(projectId);

    expect(selectionQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(selectionQuery.order).toHaveBeenCalledWith("position", {
      ascending: true,
    });
    expect(recipeQuery.in).toHaveBeenCalledWith("id", [recipeId]);
    expect(selections).toEqual([
      {
        id: selectionId,
        recipeId,
        title: recipeRow.title,
        note: selectionRow.note,
        servingsCount: selectionRow.servings_count,
        servingsLabel: selectionRow.servings_label,
        status: "active",
      },
    ]);
  });

  it("filters catalog recipes through repository-side search and multi-tag queries", async () => {
    const recipeTitleSearchQuery = createQueryBuilderMock<Array<Pick<RecipeRow, "id">>>(
      [{ id: recipeId }]
    );
    const recipeSummarySearchQuery = createQueryBuilderMock<
      Array<Pick<RecipeRow, "id">>
    >([]);
    const recipeListQuery = createQueryBuilderMock<RecipeRow[]>([recipeRow]);
    const ingredientDisplaySearchQuery = createQueryBuilderMock<
      Array<Pick<RecipeIngredientRow, "recipe_id">>
    >([]);
    const ingredientNormalizedSearchQuery = createQueryBuilderMock<
      Array<Pick<RecipeIngredientRow, "recipe_id">>
    >([]);
    const filterTagsQuery = createQueryBuilderMock<RecipeTagRow[]>([
      tagRow,
      secondTagRow,
    ]);
    const filteredTagLinksQuery = createQueryBuilderMock<RecipeTagLinkRow[]>([
      tagLinkRow,
      secondTagLinkRow,
    ]);
    const recipeTagLinksQuery = createQueryBuilderMock<RecipeTagLinkRow[]>([
      tagLinkRow,
      secondTagLinkRow,
    ]);
    const loadedTagsQuery = createQueryBuilderMock<RecipeTagRow[]>([
      tagRow,
      secondTagRow,
    ]);
    const selectionQuery = createQueryBuilderMock<RecipeSelectionRow[]>([
      selectionRow,
    ]);
    const client = createClient({
      recipes: [
        recipeTitleSearchQuery,
        recipeSummarySearchQuery,
        recipeListQuery,
      ],
      recipe_ingredients: [
        ingredientDisplaySearchQuery,
        ingredientNormalizedSearchQuery,
      ],
      recipe_tags: [filterTagsQuery, loadedTagsQuery],
      recipe_tag_links: [filteredTagLinksQuery, recipeTagLinksQuery],
      recipe_selections: selectionQuery,
    });

    const repository = createCatalogRepository(client);
    const recipes = await repository.listByProject({
      projectId,
      filters: {
        search: "citron",
        tagSlugs: ["rapide", "poulet"],
      },
    });

    expect(recipeTitleSearchQuery.ilike).toHaveBeenCalledWith("title", "%citron%");
    expect(recipeSummarySearchQuery.ilike).toHaveBeenCalledWith(
      "summary",
      "%citron%"
    );
    expect(filterTagsQuery.in).toHaveBeenCalledWith("slug", [
      "poulet",
      "rapide",
    ]);
    expect(filteredTagLinksQuery.in).toHaveBeenCalledWith("tag_id", [
      tagId,
      secondTagId,
    ]);
    expect(recipeListQuery.in).toHaveBeenCalledWith("id", [recipeId]);
    expect(recipeTagLinksQuery.in).toHaveBeenCalledWith("recipe_id", [recipeId]);
    expect(recipes).toEqual([
      expect.objectContaining({
        id: recipeId,
        isInQuickList: true,
        tags: [
          expect.objectContaining({ label: tagRow.label }),
          expect.objectContaining({ label: secondTagRow.label }),
        ],
      }),
    ]);
  });

  it("lists recipe tags for the catalogue from persisted links", async () => {
    const tagLinksQuery = createQueryBuilderMock<RecipeTagLinkRow[]>([
      tagLinkRow,
      secondTagLinkRow,
    ]);
    const tagsQuery = createQueryBuilderMock<RecipeTagRow[]>([
      secondTagRow,
      tagRow,
    ]);
    const client = createClient({
      recipe_tag_links: tagLinksQuery,
      recipe_tags: tagsQuery,
    });

    const repository = createCatalogRepository(client);
    const tags = await repository.listTagsByProject(projectId);

    expect(tagLinksQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(tagsQuery.in).toHaveBeenCalledWith("id", [tagId, secondTagId]);
    expect(tags.map((tag) => tag.slug)).toEqual(["poulet", "rapide"]);
  });

  it("builds the shopping list from persisted shopping list rows", async () => {
    const shoppingListQuery = createQueryBuilderMock<ShoppingListRow | null>(
      shoppingListRow
    );
    const shoppingItemsQuery = createQueryBuilderMock<ShoppingListItemRow[]>(
      shoppingItemRows
    );
    const client = createClient({
      shopping_lists: shoppingListQuery,
      shopping_list_items: shoppingItemsQuery,
    });

    const repository = createShoppingRepository(client);
    const shoppingList = await repository.getShoppingList(projectId);

    expect(shoppingListQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(shoppingItemsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(shoppingItemsQuery.eq).toHaveBeenCalledWith(
      "shopping_list_id",
      shoppingListId
    );
    expect(shoppingList.groups).toHaveLength(2);
    expect(shoppingList.checkedCount).toBe(1);
    expect(shoppingList.pendingCount).toBe(1);
    expect(shoppingList.groups[0]?.items[0]?.recipes[0]?.title).toBe(
      recipeRow.title
    );
  });
});
