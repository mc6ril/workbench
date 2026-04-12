"use client";

import Text from "@/shared/design-system/text";
import { useTranslation } from "@/shared/i18n";

import RecipeDetailAdditionsSection from "./RecipeDetailAdditionsSection";
import RecipeDetailIngredientsSection from "./RecipeDetailIngredientsSection";
import RecipeDetailMetaSummary from "./RecipeDetailMetaSummary";
import RecipeDetailStepsSection from "./RecipeDetailStepsSection";
import RecipeDetailTagList from "./RecipeDetailTagList";
import styles from "./styles.module.scss";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { isAdditionCandidateIngredient } from "@/modules/recipes/core/domain/recipe.types";

type Props = {
  recipe: CatalogRecipeDetail;
  canValidateAdditions: boolean;
  validatingIngredientId?: string | null;
  isValidationPending?: boolean;
  actionError?: string | null;
  onValidateAddition: (ingredientId: string) => Promise<void> | void;
};

const RecipeDetailView = ({
  recipe,
  canValidateAdditions,
  validatingIngredientId = null,
  isValidationPending = false,
  actionError = null,
  onValidateAddition,
}: Props) => {
  const t = useTranslation("pages.recipes.detail");
  const validatedIngredients = recipe.ingredients.filter(
    (ingredient) => !isAdditionCandidateIngredient(ingredient)
  );
  const additionIngredients = recipe.ingredients.filter((ingredient) =>
    isAdditionCandidateIngredient(ingredient)
  );

  return (
    <div className={styles["recipe-detail"]}>
      <RecipeDetailTagList tags={recipe.tags} />

      <RecipeDetailAdditionsSection
        additions={additionIngredients}
        canValidateAdditions={canValidateAdditions}
        validatingIngredientId={validatingIngredientId}
        isValidationPending={isValidationPending}
        onValidateAddition={onValidateAddition}
        t={t}
      />

      <RecipeDetailMetaSummary
        servingsLabel={recipe.servingsLabel}
        totalTimeLabel={recipe.totalTimeLabel}
      />

      <div className={styles["recipe-detail__content"]}>
        <RecipeDetailIngredientsSection
          ingredients={validatedIngredients}
          t={t}
        />

        <RecipeDetailStepsSection steps={recipe.steps} t={t} />
      </div>

      {actionError ? (
        <Text variant="small" className={styles["recipe-detail__error"]}>
          {actionError}
        </Text>
      ) : null}
    </div>
  );
};

export default RecipeDetailView;
