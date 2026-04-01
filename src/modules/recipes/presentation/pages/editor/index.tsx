import Card from "@/shared/design-system/card";

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

const RecipeEditorPage = ({ projectId, mode, recipeId }: Props) => {
  const isCreate = mode === "create";
  const pageTitle = isCreate
    ? "Creation d'une recette"
    : "Edition d'une recette";
  const pageDescription = isCreate
    ? "La route creation entre dans le module sans logique produit cachee. Elle pose juste le bon point d'ancrage pour l'editeur futur."
    : "La route edition reprend l'intention de la preview: meme confort visuel que la lecture, mais avec une structure proprement separee.";
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
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>4</span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              blocs editor verrouilles avant d&apos;ajouter sauvegarde,
              validations et draft serveur.
            </span>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__grid"]}>
        <RecipeEditorOutlineCard href={actionHref} mode={mode} />
        <QuickListSummaryCard
          href={buildRecipesQuickListRoute(projectId)}
          variant={isCreate ? "empty" : "active"}
        />
      </div>

      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 2: formulaire reel, upload d&apos;image, sauvegarde,
        gestion des tags et edition basee sur une recette persistee
        {recipeId ? ` (${recipeId}).` : "."}
      </p>
    </RecipesPageScaffold>
  );
};

export default RecipeEditorPage;
