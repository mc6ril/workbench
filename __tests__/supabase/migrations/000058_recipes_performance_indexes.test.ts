import { loadNormalizedMigrationSql } from "./loadMigrationSql";

const normalizedSql = loadNormalizedMigrationSql(
  "000058_recipes_performance_indexes.sql"
);

describe("000058_recipes_performance_indexes.sql", () => {
  it("adds the targeted recipes performance indexes introduced in step 12", () => {
    expect(normalizedSql).toContain(
      "CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipes_project_updated_at ON public.recipes(project_id, updated_at DESC)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipe_tag_links_project_tag_recipe ON public.recipe_tag_links(project_id, tag_id, recipe_id)"
    );
    expect(normalizedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON public.recipes USING GIN (title public.gin_trgm_ops)"
    );
  });
});
