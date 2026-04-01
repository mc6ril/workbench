import type { SupabaseClient } from "@supabase/supabase-js";

import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";
import {
  loadRecipeGraphsByIds,
  mapLoadedRecipeGraphToDraft,
} from "@/modules/recipes/infrastructure/supabase/shared/readModels";
import {
  getCreationDraftFixture,
  getRecipeDraftFixture,
} from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

/**
 * Step 5:
 * creation stays intentionally local to the module until save flows land,
 * while edit mode now reads from the real Recipes schema.
 */
export const createEditorRepository = (
  client: SupabaseClient
): EditorRepository => ({
  async getCreationDraft(_projectId) {
    return getCreationDraftFixture();
  },

  async getDraft(projectId, recipeId) {
    const recipeGraphs = await loadRecipeGraphsByIds(client, projectId, [recipeId]);
    const recipeGraph = recipeGraphs.get(recipeId);

    if (!recipeGraph) {
      return getRecipeDraftFixture(recipeId);
    }

    return mapLoadedRecipeGraphToDraft(recipeGraph);
  },
});
