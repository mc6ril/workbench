import type { SupabaseClient } from "@supabase/supabase-js";

import {
  EMPTY_RECIPE_DRAFT,
} from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";

/**
 * Step 2 scaffold:
 * the editor contract exists now, while persistence stays isolated for later steps.
 */
export const createEditorRepository = (
  _client: SupabaseClient
): EditorRepository => ({
  async getCreationDraft() {
    return EMPTY_RECIPE_DRAFT;
  },

  async getDraft() {
    return null;
  },
});
