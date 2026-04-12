import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000057_recipes_persistence.sql"
);

describe("000057_recipes_persistence.sql", () => {
  it("creates the Recipes persistence tables", () => {
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.recipes ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.recipe_steps ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.recipe_ingredients ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.recipe_tags ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.recipe_tag_links ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.recipe_selections ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.shopping_lists ("
    );
    expect(normalizedSql).toContain(
      "CREATE TABLE IF NOT EXISTS public.shopping_list_items ("
    );
  });

  it("enforces project-scoped integrity through unique constraints and composite foreign keys", () => {
    expect(normalizedSql).toContain(
      "CONSTRAINT uk_recipes_id_project UNIQUE (id, project_id)"
    );
    expect(normalizedSql).toContain(
      "CONSTRAINT fk_recipe_steps_recipe FOREIGN KEY (recipe_id, project_id) REFERENCES public.recipes(id, project_id) ON DELETE CASCADE"
    );
    expect(normalizedSql).toContain(
      "CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id, project_id) REFERENCES public.recipes(id, project_id) ON DELETE CASCADE"
    );
    expect(normalizedSql).toContain(
      "CONSTRAINT fk_recipe_selections_recipe FOREIGN KEY (recipe_id, project_id) REFERENCES public.recipes(id, project_id) ON DELETE CASCADE"
    );
    expect(normalizedSql).toContain(
      "CONSTRAINT fk_shopping_list_items_list FOREIGN KEY (shopping_list_id, project_id) REFERENCES public.shopping_lists(id, project_id) ON DELETE CASCADE"
    );
    expect(normalizedSql).toContain(
      "CONSTRAINT uk_recipe_selections_project_recipe UNIQUE (project_id, recipe_id)"
    );
  });

  it("adds the minimum useful indexes for project lookups and ordered reads", () => {
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipes_project_id ON public.recipes(project_id)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_position ON public.recipe_steps(project_id, recipe_id, position)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_position ON public.recipe_ingredients(project_id, recipe_id, position)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipe_selections_project_position ON public.recipe_selections(project_id, position)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_position ON public.shopping_list_items(project_id, shopping_list_id, group_id, position)"
    );
  });

  it("stores shopping item recipe sources as a persisted jsonb projection", () => {
    expect(normalizedSql).toContain(
      "recipe_sources jsonb NOT NULL DEFAULT '[]'::jsonb CHECK ( jsonb_typeof(recipe_sources) = 'array' )"
    );
  });

  it("enables RLS with project-based read and edit policies", () => {
    expect(normalizedSql).toContain(
      "ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE public.recipe_selections ENABLE ROW LEVEL SECURITY"
    );
    expect(normalizedSql).toContain(
      "ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY"
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "Recipes members can view" ON public.recipes FOR SELECT USING ((select public.is_project_member(project_id)))'
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "Recipe selections editors can update" ON public.recipe_selections FOR UPDATE USING ((select public.can_edit_project(project_id))) WITH CHECK ((select public.can_edit_project(project_id)))'
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "Shopping list items editors can delete" ON public.shopping_list_items FOR DELETE USING ((select public.can_edit_project(project_id)))'
    );
  });
});
