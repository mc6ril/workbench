"use client";

import { useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";

import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import ErrorMessage from "@/shared/design-system/error_message";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import Link from "@/shared/design-system/link";
import Textarea from "@/shared/design-system/textarea";

import componentStyles from "./RecipeEditorClientPage.module.scss";

import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import {
  buildRecipeTagSlug,
  normalizeRecipeTagLabel,
} from "@/modules/recipes/core/domain/editor/recipeEditor.helpers";
import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";
import { RECIPE_INGREDIENT_UNIT_VALUES } from "@/modules/recipes/core/domain/recipe.types";
import { RecipeEditorSubmissionSchema } from "@/modules/recipes/core/usecases/editor/saveRecipe";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import { useCreateRecipe } from "@/modules/recipes/presentation/hooks/editor/useCreateRecipe";
import { useUpdateRecipe } from "@/modules/recipes/presentation/hooks/editor/useUpdateRecipe";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipeDetailRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  mode: "create" | "edit";
  draft: RecipeDraft;
  availableTags: RecipeTag[];
  quickListRecipes: QuickListRecipe[];
};

const createEmptyIngredientRow = () => ({
  amount: "",
  unit: "",
  displayName: "",
  notes: "",
});

const createEmptyStepRow = () => ({
  instruction: "",
  meta: "",
});

const getFieldMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return undefined;
};

const mapDraftToFormValues = (
  projectId: string,
  draft: RecipeDraft
): SaveRecipeEditorInput => {
  const validatedIngredients = draft.ingredients
    .filter((ingredient) => ingredient.kind === "validated")
    .map((ingredient) => ({
      amount: ingredient.amountText ?? "",
      unit: ingredient.unit ?? "",
      displayName: ingredient.displayName,
      notes: ingredient.notes ?? "",
    }));
  const additionIngredients = draft.ingredients
    .filter((ingredient) => ingredient.kind === "addition_candidate")
    .map((ingredient) => ({
      amount: ingredient.amountText ?? "",
      unit: ingredient.unit ?? "",
      displayName: ingredient.displayName,
      notes: ingredient.notes ?? "",
    }));

  return {
    projectId,
    title: draft.title,
    summary: draft.summary,
    servingsCount: draft.servingsCount?.toString() ?? "",
    servingsLabel: draft.servingsLabel,
    totalTimeMinutes: draft.totalTimeMinutes?.toString() ?? "",
    coverImageUrl: draft.coverImageUrl ?? "",
    note: draft.note ?? "",
    tags: draft.tags.map((tag) => ({
      label: tag.label,
    })),
    validatedIngredients:
      validatedIngredients.length > 0
        ? validatedIngredients
        : [createEmptyIngredientRow()],
    additionIngredients,
    steps:
      draft.steps.length > 0
        ? draft.steps.map((step) => ({
            instruction: step.instruction,
            meta: step.meta ?? "",
          }))
        : [createEmptyStepRow()],
  };
};

const RecipeEditorClientPage = ({
  projectId,
  mode,
  draft,
  availableTags,
  quickListRecipes,
}: Props) => {
  const isCreate = mode === "create";
  const router = useRouter();
  const [tagDraft, setTagDraft] = useState("");
  const [isRouting, startRouting] = useTransition();
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const defaultValues = useMemo(
    () => mapDraftToFormValues(projectId, draft),
    [draft, projectId]
  );
  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SaveRecipeEditorInput>({
    resolver: zodResolver(RecipeEditorSubmissionSchema),
    mode: "onBlur",
    defaultValues,
  });
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags",
  });
  const {
    fields: validatedIngredientFields,
    append: appendValidatedIngredient,
    remove: removeValidatedIngredient,
    move: moveValidatedIngredient,
  } = useFieldArray({
    control,
    name: "validatedIngredients",
  });
  const {
    fields: additionIngredientFields,
    append: appendAdditionIngredient,
    remove: removeAdditionIngredient,
    move: moveAdditionIngredient,
  } = useFieldArray({
    control,
    name: "additionIngredients",
  });
  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({
    control,
    name: "steps",
  });
  const watchedTitle = useWatch({
    control,
    name: "title",
  });
  const watchedServingsCount = useWatch({
    control,
    name: "servingsCount",
  });
  const watchedServingsLabel = useWatch({
    control,
    name: "servingsLabel",
  });
  const watchedTotalTimeMinutes = useWatch({
    control,
    name: "totalTimeMinutes",
  });
  const watchedCoverImageUrl = useWatch({
    control,
    name: "coverImageUrl",
  });
  const watchedTagsValue = useWatch({
    control,
    name: "tags",
  });
  const watchedTags = useMemo(() => watchedTagsValue ?? [], [watchedTagsValue]);
  const watchedValidatedIngredients = useWatch({
    control,
    name: "validatedIngredients",
  }) ?? [];
  const watchedAdditionIngredients = useWatch({
    control,
    name: "additionIngredients",
  }) ?? [];
  const watchedSteps = useWatch({
    control,
    name: "steps",
  }) ?? [];

  const isPending =
    createRecipeMutation.isPending ||
    updateRecipeMutation.isPending ||
    isRouting;

  const selectedTagSlugs = useMemo(() => {
    return new Set(
      watchedTags
        .map((tag) => normalizeRecipeTagLabel(tag.label))
        .flatMap((label) => (label ? [buildRecipeTagSlug(label)] : []))
    );
  }, [watchedTags]);

  const remainingTagSuggestions = useMemo(() => {
    return availableTags.filter((tag) => !selectedTagSlugs.has(tag.slug));
  }, [availableTags, selectedTagSlugs]);

  const resolvedServingsLabel =
    normalizeRecipeTagLabel(watchedServingsLabel) ??
    (normalizeRecipeTagLabel(watchedServingsCount)
      ? `${watchedServingsCount} portions`
      : "A definir");
  const resolvedTimeLabel = normalizeRecipeTagLabel(watchedTotalTimeMinutes)
    ? `${watchedTotalTimeMinutes} min`
    : "A estimer";
  const nonBlankValidatedIngredients = watchedValidatedIngredients.filter(
    (ingredient) =>
      normalizeRecipeTagLabel(ingredient.amount) ||
      normalizeRecipeTagLabel(ingredient.unit) ||
      normalizeRecipeTagLabel(ingredient.displayName) ||
      normalizeRecipeTagLabel(ingredient.notes)
  );
  const nonBlankAdditionIngredients = watchedAdditionIngredients.filter(
    (ingredient) =>
      normalizeRecipeTagLabel(ingredient.amount) ||
      normalizeRecipeTagLabel(ingredient.unit) ||
      normalizeRecipeTagLabel(ingredient.displayName) ||
      normalizeRecipeTagLabel(ingredient.notes)
  );
  const nonBlankSteps = watchedSteps.filter(
    (step) =>
      normalizeRecipeTagLabel(step.instruction) ||
      normalizeRecipeTagLabel(step.meta)
  );

  const handleAddTag = (candidate: string) => {
    const label = normalizeRecipeTagLabel(candidate);

    if (!label) {
      return;
    }

    const slug = buildRecipeTagSlug(label);

    if (!slug || selectedTagSlugs.has(slug)) {
      setTagDraft("");
      return;
    }

    appendTag({
      label,
    });
    clearErrors("tags");
    setTagDraft("");
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");

    try {
      const savedRecipe = isCreate
        ? await createRecipeMutation.mutateAsync(values)
        : await updateRecipeMutation.mutateAsync({
            ...values,
            recipeId: draft.id ?? "",
          });

      if (!savedRecipe.id) {
        setError("root", {
          type: "server",
          message: "La recette a ete enregistree sans identifiant exploitable.",
        });
        return;
      }

      startRouting(() => {
        router.push(buildRecipeDetailRoute(projectId, savedRecipe.id ?? ""));
      });
    } catch (error) {
      if (error instanceof ZodError) {
        for (const issue of error.issues) {
          const path = issue.path.join(".");

          if (!path) {
            continue;
          }

          setError(path as never, {
            type: "server",
            message: issue.message,
          });
        }

        return;
      }

      setError("root", {
        type: "server",
        message: "Impossible d'enregistrer la recette pour l'instant.",
      });
    }
  });

  return (
    <div className={componentStyles["editor-layout"]}>
      <Form
        onSubmit={onSubmit}
        className={componentStyles["editor-form"]}
        error={getFieldMessage(errors.root)}
      >
        <input type="hidden" {...register("projectId")} />
        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>
                {isCreate ? "Creation" : "Edition"}
              </p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Une recette propre a reprendre sans perdre le fil
              </h2>
            </div>
          }
        >
          <div className={componentStyles["editor-section"]}>
            <p className={componentStyles["editor-copy"]}>
              Le formulaire garde la lecture validee en preview: base claire,
              ajouts a part, etapes courtes et sauvegarde simple.
            </p>

            <div className={componentStyles["editor-grid"]}>
              <Input
                label="Titre"
                placeholder="Poulet citron & riz pilaf"
                error={errors.title?.message}
                disabled={isPending}
                {...register("title")}
              />
              <Input
                label="Image"
                type="url"
                placeholder="https://..."
                helperText="URL simple compatible avec cover_image_url."
                error={errors.coverImageUrl?.message}
                disabled={isPending}
                {...register("coverImageUrl")}
              />
              <Input
                label="Portions"
                type="number"
                inputMode="numeric"
                placeholder="2"
                error={errors.servingsCount?.message}
                disabled={isPending}
                {...register("servingsCount")}
              />
              <Input
                label="Libelle portions"
                placeholder="2 portions"
                error={errors.servingsLabel?.message}
                disabled={isPending}
                helperText="Laisse vide pour reprendre le nombre."
                {...register("servingsLabel")}
              />
              <Input
                label="Temps estime"
                type="number"
                inputMode="numeric"
                placeholder="35"
                error={errors.totalTimeMinutes?.message}
                disabled={isPending}
                helperText="En minutes."
                {...register("totalTimeMinutes")}
              />
            </div>

            <Textarea
              label="Resume"
              rows={4}
              resize="vertical"
              error={errors.summary?.message}
              disabled={isPending}
              helperText="Une phrase ou deux pour reconnaitre la recette vite."
              {...register("summary")}
            />
          </div>
        </Card>

        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>Tags</p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Tags existants + creation inline
              </h2>
            </div>
          }
        >
          <div className={componentStyles["editor-card-stack"]}>
            <p className={componentStyles["editor-copy"]}>
              Les tags restent scopes au projet et les doublons sont evites via
              leur slug.
            </p>

            {tagFields.length > 0 ? (
              <div className={componentStyles["editor-pills"]}>
                {tagFields.map((tag, index) => (
                  <span
                    key={tag.id}
                    className={componentStyles["editor-pill"]}
                  >
                    {tag.label}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      disabled={isPending}
                      aria-label={`Retirer ${tag.label}`}
                    >
                      Retirer
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className={componentStyles["editor-empty-state"]}>
                <p className={componentStyles["editor-empty-copy"]}>
                  Aucun tag selectionne pour l&apos;instant.
                </p>
              </div>
            )}

            {getFieldMessage(errors.tags) ? (
              <ErrorMessage
                message={getFieldMessage(errors.tags) ?? ""}
                className={componentStyles["editor-form-error"]}
              />
            ) : null}

            <div className={componentStyles["editor-inline-form"]}>
              <Input
                label="Nouveau tag"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                placeholder="Rapide"
                disabled={isPending}
              />
              <div className={componentStyles["editor-actions"]}>
                <Button
                  label="Ajouter le tag"
                  variant="secondary"
                  onClick={() => handleAddTag(tagDraft)}
                  disabled={isPending}
                />
              </div>
            </div>

            {remainingTagSuggestions.length > 0 ? (
              <div className={componentStyles["editor-chip-row"]}>
                {remainingTagSuggestions.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={componentStyles["editor-suggestion"]}
                    onClick={() => handleAddTag(tag.label)}
                    disabled={isPending}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>
                Ingredients valides
              </p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                La base stable de la recette
              </h2>
            </div>
          }
          footer={
            <Button
              label="Ajouter un ingredient valide"
              variant="secondary"
              onClick={() => appendValidatedIngredient(createEmptyIngredientRow())}
              disabled={isPending}
            />
          }
        >
          <div className={componentStyles["editor-card-stack"]}>
            <p className={componentStyles["editor-helper"]}>
              Quantites structurees acceptees: `2`, `2.5`, `1/2`. Unites v1:
              {` ${RECIPE_INGREDIENT_UNIT_VALUES.join(", ")}.`}
            </p>

            {getFieldMessage(errors.validatedIngredients) ? (
              <ErrorMessage
                message={getFieldMessage(errors.validatedIngredients) ?? ""}
                className={componentStyles["editor-form-error"]}
              />
            ) : null}

            {validatedIngredientFields.map((field, index) => (
              <div
                key={field.id}
                className={componentStyles["editor-card"]}
              >
                <div className={componentStyles["editor-row-head"]}>
                  <span className={componentStyles["editor-row-index"]}>
                    Valide {index + 1}
                  </span>
                  <div className={componentStyles["editor-controls"]}>
                    <Button
                      label={`Monter l'ingredient valide ${index + 1}`}
                      variant="ghost"
                      onClick={() => moveValidatedIngredient(index, index - 1)}
                      disabled={isPending || index === 0}
                    >
                      Haut
                    </Button>
                    <Button
                      label={`Descendre l'ingredient valide ${index + 1}`}
                      variant="ghost"
                      onClick={() => moveValidatedIngredient(index, index + 1)}
                      disabled={
                        isPending || index === validatedIngredientFields.length - 1
                      }
                    >
                      Bas
                    </Button>
                    <Button
                      label={`Supprimer l'ingredient valide ${index + 1}`}
                      variant="ghost"
                      onClick={() => removeValidatedIngredient(index)}
                      disabled={isPending}
                    >
                      Suppr.
                    </Button>
                  </div>
                </div>

                <div
                  className={`${componentStyles["editor-grid"]} ${componentStyles["editor-grid--ingredient"]}`}
                >
                  <Input
                    label="Quantite"
                    error={
                      errors.validatedIngredients?.[index]?.amount?.message
                    }
                    disabled={isPending}
                    {...register(`validatedIngredients.${index}.amount`)}
                  />
                  <Input
                    label="Unite"
                    error={errors.validatedIngredients?.[index]?.unit?.message}
                    disabled={isPending}
                    {...register(`validatedIngredients.${index}.unit`)}
                  />
                  <Input
                    label="Ingredient"
                    error={
                      errors.validatedIngredients?.[index]?.displayName?.message
                    }
                    disabled={isPending}
                    {...register(`validatedIngredients.${index}.displayName`)}
                  />
                  <Input
                    label="Note"
                    error={errors.validatedIngredients?.[index]?.notes?.message}
                    disabled={isPending}
                    {...register(`validatedIngredients.${index}.notes`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>Ajouts</p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Pistes a tester sans brouiller la base
              </h2>
            </div>
          }
          footer={
            <Button
              label="Ajouter un ajout"
              variant="secondary"
              onClick={() => appendAdditionIngredient(createEmptyIngredientRow())}
              disabled={isPending}
            />
          }
        >
          <div className={componentStyles["editor-card-stack"]}>
            <p className={componentStyles["editor-copy"]}>
              Les ajouts restent persistants, mais clairement identifies comme
              hypotheses ou variations.
            </p>

            {additionIngredientFields.length === 0 ? (
              <div className={componentStyles["editor-empty-state"]}>
                <p className={componentStyles["editor-empty-copy"]}>
                  Aucun ajout pour l&apos;instant.
                </p>
              </div>
            ) : null}

            {additionIngredientFields.map((field, index) => (
              <div
                key={field.id}
                className={`${componentStyles["editor-card"]} ${componentStyles["editor-card--addition"]}`}
              >
                <div className={componentStyles["editor-row-head"]}>
                  <span
                    className={`${componentStyles["editor-row-index"]} ${componentStyles["editor-row-index--addition"]}`}
                  >
                    Ajout {index + 1}
                  </span>
                  <div className={componentStyles["editor-controls"]}>
                    <Button
                      label={`Monter l'ajout ${index + 1}`}
                      variant="ghost"
                      onClick={() => moveAdditionIngredient(index, index - 1)}
                      disabled={isPending || index === 0}
                    >
                      Haut
                    </Button>
                    <Button
                      label={`Descendre l'ajout ${index + 1}`}
                      variant="ghost"
                      onClick={() => moveAdditionIngredient(index, index + 1)}
                      disabled={
                        isPending || index === additionIngredientFields.length - 1
                      }
                    >
                      Bas
                    </Button>
                    <Button
                      label={`Supprimer l'ajout ${index + 1}`}
                      variant="ghost"
                      onClick={() => removeAdditionIngredient(index)}
                      disabled={isPending}
                    >
                      Suppr.
                    </Button>
                  </div>
                </div>

                <div
                  className={`${componentStyles["editor-grid"]} ${componentStyles["editor-grid--ingredient"]}`}
                >
                  <Input
                    label="Quantite"
                    error={
                      errors.additionIngredients?.[index]?.amount?.message
                    }
                    disabled={isPending}
                    {...register(`additionIngredients.${index}.amount`)}
                  />
                  <Input
                    label="Unite"
                    error={errors.additionIngredients?.[index]?.unit?.message}
                    disabled={isPending}
                    {...register(`additionIngredients.${index}.unit`)}
                  />
                  <Input
                    label="Ajout"
                    error={
                      errors.additionIngredients?.[index]?.displayName?.message
                    }
                    disabled={isPending}
                    {...register(`additionIngredients.${index}.displayName`)}
                  />
                  <Input
                    label="Note"
                    error={errors.additionIngredients?.[index]?.notes?.message}
                    disabled={isPending}
                    {...register(`additionIngredients.${index}.notes`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>Etapes</p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Une suite de blocs courts et faciles a reprendre
              </h2>
            </div>
          }
          footer={
            <Button
              label="Ajouter une etape"
              variant="secondary"
              onClick={() => appendStep(createEmptyStepRow())}
              disabled={isPending}
            />
          }
        >
          <div className={componentStyles["editor-step-stack"]}>
            {getFieldMessage(errors.steps) ? (
              <ErrorMessage
                message={getFieldMessage(errors.steps) ?? ""}
                className={componentStyles["editor-form-error"]}
              />
            ) : null}

            {stepFields.map((field, index) => (
              <div
                key={field.id}
                className={componentStyles["editor-card"]}
              >
                <div className={componentStyles["editor-row-head"]}>
                  <p className={componentStyles["editor-row-title"]}>
                    Etape {index + 1}
                  </p>
                  <div className={componentStyles["editor-controls"]}>
                    <Button
                      label={`Monter l'etape ${index + 1}`}
                      variant="ghost"
                      onClick={() => moveStep(index, index - 1)}
                      disabled={isPending || index === 0}
                    >
                      Haut
                    </Button>
                    <Button
                      label={`Descendre l'etape ${index + 1}`}
                      variant="ghost"
                      onClick={() => moveStep(index, index + 1)}
                      disabled={isPending || index === stepFields.length - 1}
                    >
                      Bas
                    </Button>
                    <Button
                      label={`Supprimer l'etape ${index + 1}`}
                      variant="ghost"
                      onClick={() => removeStep(index)}
                      disabled={isPending}
                    >
                      Suppr.
                    </Button>
                  </div>
                </div>

                <div
                  className={`${componentStyles["editor-grid"]} ${componentStyles["editor-grid--step"]}`}
                >
                  <Textarea
                    label="Instruction"
                    rows={4}
                    resize="vertical"
                    error={errors.steps?.[index]?.instruction?.message}
                    disabled={isPending}
                    {...register(`steps.${index}.instruction`)}
                  />
                  <Input
                    label="Repere"
                    placeholder="Sauce, four, 10 min..."
                    error={errors.steps?.[index]?.meta?.message}
                    disabled={isPending}
                    {...register(`steps.${index}.meta`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>Note</p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Retour de test ou rappel perso
              </h2>
            </div>
          }
        >
          <Textarea
            label="Note de recette"
            rows={4}
            resize="vertical"
            error={errors.note?.message}
            disabled={isPending}
            helperText="Optionnel. Pratique pour garder un arbitrage apres test."
            {...register("note")}
          />
        </Card>

        <Card variant="outlined">
          <div className={componentStyles["editor-actions"]}>
            <Button
              label={
                isPending
                  ? "Enregistrement..."
                  : isCreate
                    ? "Creer la recette"
                    : "Enregistrer les changements"
              }
              variant="save"
              type="submit"
              disabled={isPending}
            />
            <Link
              href={
                isCreate
                  ? buildRecipesCatalogRoute(projectId)
                  : buildRecipeDetailRoute(projectId, draft.id ?? "")
              }
            >
              {isCreate ? "Retour au catalogue" : "Retour a la recette"}
            </Link>
          </div>
        </Card>
      </Form>

      <div className={componentStyles["editor-stack"]}>
        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>
                Recap rapide
              </p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Verifier avant sauvegarde
              </h2>
            </div>
          }
        >
          <div className={componentStyles["editor-summary"]}>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Titre</span>
              <span className={componentStyles["editor-summary-value"]}>
                {normalizeRecipeTagLabel(watchedTitle) ?? "A definir"}
              </span>
            </div>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Portions</span>
              <span className={componentStyles["editor-summary-value"]}>
                {resolvedServingsLabel}
              </span>
            </div>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Temps</span>
              <span className={componentStyles["editor-summary-value"]}>
                {resolvedTimeLabel}
              </span>
            </div>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Image</span>
              <span className={componentStyles["editor-summary-value"]}>
                {normalizeRecipeTagLabel(watchedCoverImageUrl)
                  ? "URL renseignee"
                  : "Optionnelle"}
              </span>
            </div>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Base</span>
              <span className={componentStyles["editor-summary-value"]}>
                {nonBlankValidatedIngredients.length} ingredient
                {nonBlankValidatedIngredients.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Ajouts</span>
              <span className={componentStyles["editor-summary-value"]}>
                {nonBlankAdditionIngredients.length}
              </span>
            </div>
            <div className={componentStyles["editor-summary-row"]}>
              <span className={componentStyles["editor-label"]}>Etapes</span>
              <span className={componentStyles["editor-summary-value"]}>
                {nonBlankSteps.length}
              </span>
            </div>
            <div className={componentStyles["editor-field-stack"]}>
              <span className={componentStyles["editor-label"]}>Tags</span>
              {watchedTags.length > 0 ? (
                <div className={componentStyles["editor-pills"]}>
                  {watchedTags.map((tag, index) => (
                    <span
                      key={`${tag.label}-${index}`}
                      className={componentStyles["editor-pill"]}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={componentStyles["editor-summary-copy"]}>
                  Aucun tag selectionne.
                </p>
              )}
            </div>
          </div>
        </Card>

        <QuickListSummaryCard
          projectId={projectId}
          recipes={quickListRecipes}
        />

        <Card
          variant="outlined"
          title={
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>Repere</p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Une sauvegarde simple, sans avancer l&apos;etape 8
              </h2>
            </div>
          }
          footer={<Link href={buildRecipesCatalogRoute(projectId)}>Voir le catalogue</Link>}
        >
          <ul className={styles["recipes-scaffold__list"]}>
            <li>Pas d&apos;autosave ni de drag-and-drop.</li>
            <li>Les boutons haut / bas suffisent pour le v1.</li>
            <li>Les tags inline restent scopes au projet.</li>
            <li>Le save renvoie vers la fiche recette pour rester lisible.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default RecipeEditorClientPage;
