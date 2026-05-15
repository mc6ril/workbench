"use client";

import { useCallback, useState } from "react";

import Button from "@/shared/design-system/button";
import { useTranslation } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { isUuid } from "@/shared/utils/uuid";

import {
  useRegisterToolbarActions,
  useRegisterToolbarBreadcrumb,
} from "@/domains/project/presentation/contexts/ToolbarBreadcrumb";
import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import RecipeDetailView from "@/modules/recipes/presentation/components/catalog/RecipeDetailView";
import { usePromoteRecipeAddition } from "@/modules/recipes/presentation/hooks/editor/usePromoteRecipeAddition";

type Props = {
  projectId: string;
  recipe: CatalogRecipeDetail;
  editHref: string;
  editLabel: string;
  editAriaLabel: string;
};

const Client = ({
  projectId,
  recipe,
  editHref,
  editLabel,
  editAriaLabel,
}: Props) => {
  const t = useTranslation("pages.recipes.detail");
  const router = useAppRouter();
  useRegisterToolbarBreadcrumb(recipe.title);

  const renderEditAction = useCallback(
    () => (
      <Button
        variant="publish"
        label={editAriaLabel}
        onClick={() => router.push(editHref)}
      >
        {editLabel}
      </Button>
    ),
    [editHref, editLabel, editAriaLabel, router]
  );
  useRegisterToolbarActions(renderEditAction);

  const promoteAdditionMutation = usePromoteRecipeAddition();
  const [actionError, setActionError] = useState<string | null>(null);
  const canValidateAdditions = isUuid(recipe.id);

  const handleValidateAddition = useCallback(
    async (ingredientId: string) => {
      setActionError(null);

      try {
        await promoteAdditionMutation.mutateAsync({
          projectId,
          recipeId: recipe.id,
          ingredientId,
        });
        router.refresh();
      } catch {
        setActionError(t("errors.validateAddition"));
      }
    },
    [promoteAdditionMutation, projectId, recipe.id, router, t]
  );

  return (
    <RecipeDetailView
      recipe={recipe}
      canValidateAdditions={canValidateAdditions}
      validatingIngredientId={
        promoteAdditionMutation.variables?.ingredientId ?? null
      }
      isValidationPending={promoteAdditionMutation.isPending}
      actionError={actionError}
      onValidateAddition={handleValidateAddition}
    />
  );
};

export default Client;
