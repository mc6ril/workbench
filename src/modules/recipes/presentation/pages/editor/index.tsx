import { notFound } from "next/navigation";

import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { RECIPE_INGREDIENT_UNIT_VALUES } from "@/modules/recipes/core/domain/recipe.types";
import { getRecipeDraft } from "@/modules/recipes/core/usecases/editor/getRecipeDraft";
import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { createEditorRepository } from "@/modules/recipes/infrastructure/supabase/editor/EditorRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import RecipeEditorClientPage from "@/modules/recipes/presentation/components/editor/RecipeEditorClientPage";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipeDetailRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  mode: "create" | "edit";
  recipeId?: string;
};

const RecipeEditorPage = async ({ projectId, mode, recipeId }: Props) => {
  const isCreate = mode === "create";
  const supabaseClient = await createSupabaseServerClient();
  const editorRepository = createEditorRepository(supabaseClient);
  const plannerRepository = createPlannerRepository(supabaseClient);
  const [draft, quickListRecipes, availableTags] = await Promise.all([
    getRecipeDraft({
      editorRepository,
    })({
      projectId,
      recipeId,
    }),
    listActiveSelections({
      plannerRepository,
    })(projectId),
    editorRepository.listTagsByProject(projectId),
  ]);

  if (!draft) {
    notFound();
  }

  const pageTitle = isCreate
    ? "Creer une recette"
    : "Modifier la recette";
  const pageDescription = isCreate
    ? "Une entree simple pour poser ta recette, separer la base des ajouts et sauvegarder proprement dans le vrai schema Recipes."
    : "La fiche d'edition garde la structure validee en preview, avec un vrai save pour les ingredients, tags, image et etapes.";

  return (
    <RecipesPageScaffold
      eyebrow={isCreate ? "Recipes / creation" : "Recipes / edition"}
      title={pageTitle}
      description={pageDescription}
      actions={[
        {
          href: isCreate
            ? buildRecipesCatalogRoute(projectId)
            : buildRecipeDetailRoute(projectId, recipeId ?? ""),
          label: isCreate ? "Retour au catalogue" : "Retour a la recette",
        },
      ]}
      aside={
        <Card variant="outlined">
          <div className={styles["recipes-scaffold__stack"]}>
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>
                Regles actives
              </p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Regles du v1
              </h2>
            </div>
            <ul className={styles["recipes-scaffold__list"]}>
              <li>Quantites structurees: `2`, `2.5`, `1/2`.</li>
              <li>Unites v1: {RECIPE_INGREDIENT_UNIT_VALUES.join(", ")}.</li>
              <li>Fallback conserve `amountText` si la quantite reste libre.</li>
              <li>Reordonnancement simple avec boutons haut / bas.</li>
            </ul>
          </div>
        </Card>
      }
    >
      <RecipeEditorClientPage
        projectId={projectId}
        mode={mode}
        draft={draft}
        availableTags={availableTags}
        quickListRecipes={quickListRecipes}
      />
    </RecipesPageScaffold>
  );
};

export default RecipeEditorPage;
