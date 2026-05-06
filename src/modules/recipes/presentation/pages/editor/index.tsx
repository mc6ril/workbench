import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import { getRecipeDraft } from "@/modules/recipes/core/usecases/editor/getRecipeDraft";
import { listRecipeEditorTags } from "@/modules/recipes/core/usecases/editor/listRecipeEditorTags";
import { createEditorRepository } from "@/modules/recipes/infrastructure/supabase/editor/EditorRepository.supabase";
import RecipeEditorClientPage from "@/modules/recipes/presentation/components/editor/RecipeEditorClientPage";

type Props = {
  projectId: string;
  mode: "create" | "edit";
  recipeId?: string;
};

const RecipeEditorPage = async ({ projectId, mode, recipeId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const editorRepository = createEditorRepository(supabaseClient);
  const [draft, availableTags] = await Promise.all([
    getRecipeDraft({
      editorRepository,
    })({
      projectId,
      recipeId,
    }),
    listRecipeEditorTags({
      editorRepository,
    })(projectId),
  ]);

  if (!draft) {
    notFound();
  }

  return (
    <RecipeEditorClientPage
      projectId={projectId}
      mode={mode}
      draft={draft}
      availableTags={availableTags}
    />
  );
};

export default RecipeEditorPage;
