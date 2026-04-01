import Badge from "@/shared/design-system/badge";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
} from "@/modules/recipes/core/domain/recipe.types";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  recipe: CatalogRecipeDetail;
  editHref: string;
  shoppingHref: string;
};

const RecipeDetailSummaryCard = ({
  recipe,
  editHref,
  shoppingHref,
}: Props) => {
  const validatedIngredients = recipe.ingredients.filter(
    (ingredient) => !isAdditionCandidateIngredient(ingredient)
  );
  const additionIngredients = recipe.ingredients.filter((ingredient) =>
    isAdditionCandidateIngredient(ingredient)
  );

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Fiche recette
          </p>
          <div className={styles["recipes-scaffold__summary-head"]}>
            <h2 className={styles["recipes-scaffold__panel-title"]}>
              {recipe.title}
            </h2>
            <Badge
              label={recipe.isInQuickList ? "Active" : "Catalogue"}
              variant={recipe.isInQuickList ? "success" : "default"}
              size="small"
            />
          </div>
        </div>
      }
      footer={
        <div className={styles["recipes-scaffold__actions"]}>
          <Link href={editHref}>Ouvrir l&apos;edition</Link>
          <Link href={shoppingHref}>Voir les courses</Link>
        </div>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        La route detail garde l&apos;intention preview: lecture calme,
        ingredients tres visibles, puis etapes faciles a reprendre.
      </p>
      <p className={styles["recipes-scaffold__helper"]}>
        {recipe.isInQuickList
          ? "Cette recette est active dans la quick list."
          : "Cette recette reste dans le catalogue tant qu’elle n’est pas sélectionnée."}
      </p>
      {recipe.tags.length > 0 ? (
        <div className={styles["recipes-scaffold__pill-row"]}>
          {recipe.tags.map((tag) => (
            <span key={tag.id} className={styles["recipes-scaffold__pill"]}>
              {tag.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className={styles["recipes-scaffold__field-grid"]}>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Ingredients</p>
          <ul className={styles["recipes-scaffold__list"]}>
            {validatedIngredients.slice(0, 5).map((ingredient) => (
              <li key={ingredient.id}>
                {formatRecipeIngredientLabel(ingredient)}
              </li>
            ))}
            {validatedIngredients.length === 0 ? (
              <li>Aucun ingredient valide pour l&apos;instant.</li>
            ) : null}
          </ul>
        </div>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Etapes</p>
          <ul className={styles["recipes-scaffold__list"]}>
            {recipe.steps.slice(0, 4).map((step) => (
              <li key={step.id}>
                Etape {step.position}: {step.instruction}
              </li>
            ))}
            {recipe.steps.length === 0 ? (
              <li>Aucune etape pour l&apos;instant.</li>
            ) : null}
          </ul>
        </div>
      </div>
      {additionIngredients.length > 0 ? (
        <p className={styles["recipes-scaffold__note"]}>
          Ajouts a tester:{" "}
          {additionIngredients
            .map((ingredient) => formatRecipeIngredientLabel(ingredient))
            .join(", ")}
        </p>
      ) : null}
    </Card>
  );
};

export default RecipeDetailSummaryCard;
