import type { SupabaseClient } from "@supabase/supabase-js";

import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";

const EMPTY_RECIPE_DRAFT: RecipeDraft = {
  id: null,
  title: "",
  summary: "",
  servingsLabel: "",
  totalTimeLabel: "",
  tags: [],
  ingredients: [],
  steps: [],
};

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
