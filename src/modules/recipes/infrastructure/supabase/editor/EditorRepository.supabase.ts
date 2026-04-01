import type { SupabaseClient } from "@supabase/supabase-js";

import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";
import {
  getCreationDraftFixture,
  getRecipeDraftFixture,
} from "@/modules/recipes/infrastructure/supabase/shared/recipesFixtureData";

/**
 * Step 4 foundation:
 * draft data stays isolated behind the repository while the ingredient
 * normalization rules are exercised by both editor and shopping flows.
 */
export const createEditorRepository = (
  _client: SupabaseClient
): EditorRepository => ({
  async getCreationDraft(_projectId) {
    return getCreationDraftFixture();
  },

  async getDraft(_projectId, recipeId) {
    return getRecipeDraftFixture(recipeId);
  },
});
