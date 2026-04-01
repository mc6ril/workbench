import { notFound } from "next/navigation";

import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { RECIPE_INGREDIENT_UNIT_VALUES } from "@/modules/recipes/core/domain/recipe.types";
import { getRecipeDraft } from "@/modules/recipes/core/usecases/editor/getRecipeDraft";
import { listQuickListRecipes } from "@/modules/recipes/core/usecases/planner/listQuickListRecipes";
import { createEditorRepository } from "@/modules/recipes/infrastructure/supabase/editor/EditorRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import RecipeEditorOutlineCard from "@/modules/recipes/presentation/components/editor/RecipeEditorOutlineCard";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipesCatalogRoute,
  buildRecipesQuickListRoute,
  buildRecipesShoppingRoute,
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
  const draft = await getRecipeDraft({
    editorRepository,
  })({
    projectId,
    recipeId,
  });
  const quickListRecipes = await listQuickListRecipes({
    plannerRepository,
  })(projectId);

  if (!draft) {
    notFound();
  }
  const pageTitle = isCreate
    ? "Creation d'une recette"
    : "Edition d'une recette";
  const pageDescription = isCreate
    ? "La creation reprend la maquette validee avec un vrai format d'ingredients, sans embarquer encore la sauvegarde ni le parser avance."
    : "L'edition garde l'intention preview: meme confort de lecture, ingredients normalises et base shopping deja raccordee.";
  const actionHref = isCreate
    ? buildRecipesCatalogRoute(projectId)
    : buildRecipesShoppingRoute(projectId);

  return (
    <RecipesPageScaffold
      eyebrow={isCreate ? "Recipes / creation" : "Recipes / edition"}
      title={pageTitle}
      description={pageDescription}
      actions={[
        {
          href: buildRecipesCatalogRoute(projectId),
          label: "Retour au catalogue",
        },
        {
          href: buildRecipesQuickListRoute(projectId),
          label: "Voir la quick list",
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
                Format minimum fiable
              </h2>
            </div>
            <ul className={styles["recipes-scaffold__list"]}>
              <li>Quantites structurees: `2`, `2.5`, `1/2`.</li>
              <li>Unites v1: {RECIPE_INGREDIENT_UNIT_VALUES.join(", ")}.</li>
              <li>Fallback conserve `amountText` si la quantite reste libre.</li>
              <li>Aucune fusion automatique si un ingredient reste ambigu.</li>
            </ul>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__split"]}>
        <RecipeEditorOutlineCard href={actionHref} mode={mode} draft={draft} />
        <div className={styles["recipes-scaffold__stack"]}>
          <QuickListSummaryCard
            href={buildRecipesQuickListRoute(projectId)}
            recipes={quickListRecipes}
            variant={isCreate ? "empty" : "active"}
          />
          <Card variant="outlined">
            <div className={styles["recipes-scaffold__stack"]}>
              <div className={styles["recipes-scaffold__panel-head"]}>
                <p className={styles["recipes-scaffold__panel-kicker"]}>
                  Normalisation
                </p>
                <h2 className={styles["recipes-scaffold__panel-title"]}>
                  Une meme base pour edition et courses
                </h2>
              </div>
              <p className={styles["recipes-scaffold__panel-copy"]}>
                Le draft renvoie deja des ingredients nettoyes avec
                `displayName`, `normalizedName`, `amountValue`, `amountText` et
                `unit` distincts.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 4: sauvegarde, validation formulaire interactive,
        edition connectee a une vraie persistance Recipes, upload d&apos;image et
        arbitrage post-done des ajouts
        {recipeId ? ` (${recipeId}).` : "."}
      </p>
    </RecipesPageScaffold>
  );
};

export default RecipeEditorPage;
