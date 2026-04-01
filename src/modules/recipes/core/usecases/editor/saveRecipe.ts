import { z } from "zod";

import { validateUrl } from "@/shared/utils/validation";

import {
  buildRecipeTagSlug,
  normalizeRecipeEditorText,
  normalizeRecipeTagLabel,
  resolveRecipeCoverStyle,
} from "@/modules/recipes/core/domain/editor/recipeEditor.helpers";
import type {
  PersistedRecipeIngredientInput,
  PersistedRecipeInput,
  PersistedRecipeStepInput,
  PersistedRecipeTagInput,
  SaveRecipeEditorInput,
} from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import {
  createRecipeIngredientFromDraftInput,
} from "@/modules/recipes/core/domain/recipe.types";

const RecipeEditorTagInputSchema = z.object({
  label: z.string(),
});

const RecipeEditorIngredientInputSchema = z.object({
  amount: z.string(),
  unit: z.string(),
  displayName: z.string(),
  notes: z.string(),
});

const RecipeEditorStepInputSchema = z.object({
  instruction: z.string(),
  meta: z.string(),
});

const isBlankIngredientRow = (
  ingredient: SaveRecipeEditorInput["validatedIngredients"][number]
) => {
  return !normalizeRecipeEditorText(ingredient.amount) &&
    !normalizeRecipeEditorText(ingredient.unit) &&
    !normalizeRecipeEditorText(ingredient.displayName) &&
    !normalizeRecipeEditorText(ingredient.notes);
};

const isBlankStepRow = (step: SaveRecipeEditorInput["steps"][number]) => {
  return !normalizeRecipeEditorText(step.instruction) &&
    !normalizeRecipeEditorText(step.meta);
};

const isBlankTagRow = (tag: SaveRecipeEditorInput["tags"][number]) => {
  return !normalizeRecipeTagLabel(tag.label);
};

const validateNumericString = (
  value: string,
  options: {
    integer: boolean;
    positive?: boolean;
    allowZero?: boolean;
  }
) => {
  const normalizedValue = normalizeRecipeEditorText(value);

  if (!normalizedValue) {
    return null;
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return "Entrez un nombre entier.";
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return "Entrez un nombre valide.";
  }

  if (options.integer && !Number.isInteger(parsedValue)) {
    return "Entrez un nombre entier.";
  }

  if (options.positive && parsedValue <= 0) {
    return "La valeur doit etre superieure a zero.";
  }

  if (!options.allowZero && !options.positive && parsedValue < 0) {
    return "La valeur doit etre positive.";
  }

  return null;
};

export const RecipeEditorSubmissionSchema = z
  .object({
    projectId: z.string().uuid(),
    title: z
      .string()
      .transform((value) => normalizeRecipeEditorText(value) ?? "")
      .pipe(z.string().min(1, "Le titre est requis.")),
    summary: z.string(),
    servingsCount: z.string(),
    servingsLabel: z.string(),
    totalTimeMinutes: z.string(),
    coverImageUrl: z.string(),
    note: z.string(),
    tags: z.array(RecipeEditorTagInputSchema),
    validatedIngredients: z.array(RecipeEditorIngredientInputSchema),
    additionIngredients: z.array(RecipeEditorIngredientInputSchema),
    steps: z.array(RecipeEditorStepInputSchema),
  })
  .superRefine((value, ctx) => {
    const servingsError = validateNumericString(value.servingsCount, {
      integer: true,
      positive: true,
    });

    if (servingsError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["servingsCount"],
        message: servingsError,
      });
    }

    const timeError = validateNumericString(value.totalTimeMinutes, {
      integer: true,
      positive: true,
    });

    if (timeError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalTimeMinutes"],
        message: timeError,
      });
    }

    const coverImageUrl = normalizeRecipeEditorText(value.coverImageUrl);

    if (coverImageUrl && !validateUrl(coverImageUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coverImageUrl"],
        message: "L'image doit etre une URL complete.",
      });
    }

    value.validatedIngredients.forEach((ingredient, index) => {
      if (isBlankIngredientRow(ingredient)) {
        return;
      }

      if (!normalizeRecipeEditorText(ingredient.displayName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["validatedIngredients", index, "displayName"],
          message: "Le nom de l'ingredient est requis.",
        });
      }
    });

    const nonBlankValidatedIngredients = value.validatedIngredients.filter(
      (ingredient) => !isBlankIngredientRow(ingredient)
    );

    if (nonBlankValidatedIngredients.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validatedIngredients"],
        message: "Ajoutez au moins un ingredient valide.",
      });
    }

    value.additionIngredients.forEach((ingredient, index) => {
      if (isBlankIngredientRow(ingredient)) {
        return;
      }

      if (!normalizeRecipeEditorText(ingredient.displayName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["additionIngredients", index, "displayName"],
          message: "Le nom de l'ajout est requis.",
        });
      }
    });

    value.steps.forEach((step, index) => {
      if (isBlankStepRow(step)) {
        return;
      }

      if (!normalizeRecipeEditorText(step.instruction)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["steps", index, "instruction"],
          message: "Le contenu de l'etape est requis.",
        });
      }
    });

    const nonBlankSteps = value.steps.filter((step) => !isBlankStepRow(step));

    if (nonBlankSteps.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["steps"],
        message: "Ajoutez au moins une etape.",
      });
    }

    value.tags.forEach((tag, index) => {
      if (isBlankTagRow(tag)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tags", index, "label"],
          message: "Le tag ne peut pas etre vide.",
        });
      }
    });
  });

const parseInteger = (value: string): number | null => {
  const normalizedValue = normalizeRecipeEditorText(value);

  if (!normalizedValue) {
    return null;
  }

  return Number(normalizedValue);
};

const normalizeTags = (
  tags: SaveRecipeEditorInput["tags"]
): PersistedRecipeTagInput[] => {
  const tagsBySlug = new Map<string, PersistedRecipeTagInput>();

  for (const tag of tags) {
    const label = normalizeRecipeTagLabel(tag.label);

    if (!label) {
      continue;
    }

    const slug = buildRecipeTagSlug(label);

    if (!slug || tagsBySlug.has(slug)) {
      continue;
    }

    tagsBySlug.set(slug, {
      label,
      slug,
    });
  }

  return Array.from(tagsBySlug.values()).sort((left, right) =>
    left.label.localeCompare(right.label, "fr")
  );
};

const normalizeIngredients = (
  ingredients: SaveRecipeEditorInput["validatedIngredients"],
  kind: PersistedRecipeIngredientInput["kind"],
  positionOffset: number
): PersistedRecipeIngredientInput[] => {
  return ingredients
    .filter((ingredient) => !isBlankIngredientRow(ingredient))
    .map((ingredient, index) => {
      const normalizedIngredient = createRecipeIngredientFromDraftInput({
        id: `draft-${kind}-${index + 1}`,
        displayName: ingredient.displayName,
        amount: ingredient.amount,
        unit: ingredient.unit,
        notes: ingredient.notes,
        kind,
      });

      return {
        position: positionOffset + index + 1,
        displayName: normalizedIngredient.displayName,
        normalizedName: normalizedIngredient.normalizedName,
        amountValue: normalizedIngredient.amountValue,
        amountText: normalizedIngredient.amountText,
        unit: normalizedIngredient.unit,
        notes: normalizedIngredient.notes,
        kind: normalizedIngredient.kind,
      };
    });
};

const normalizeSteps = (
  steps: SaveRecipeEditorInput["steps"]
): PersistedRecipeStepInput[] => {
  return steps
    .filter((step) => !isBlankStepRow(step))
    .map((step, index) => ({
      position: index + 1,
      title: null,
      instruction: normalizeRecipeEditorText(step.instruction) ?? "",
      notes: null,
      meta: normalizeRecipeEditorText(step.meta),
    }));
};

export const normalizeRecipeEditorSubmission = (
  input: SaveRecipeEditorInput
): PersistedRecipeInput => {
  const validatedInput = RecipeEditorSubmissionSchema.parse(input);
  const title = validatedInput.title;
  const servingsCount = parseInteger(validatedInput.servingsCount);
  const servingsLabel =
    normalizeRecipeEditorText(validatedInput.servingsLabel) ??
    (servingsCount ? `${servingsCount} portions` : "");
  const totalTimeMinutes = parseInteger(validatedInput.totalTimeMinutes);
  const totalTimeLabel = totalTimeMinutes ? `${totalTimeMinutes} min` : "";
  const validatedIngredients = normalizeIngredients(
    validatedInput.validatedIngredients,
    "validated",
    0
  );
  const additionIngredients = normalizeIngredients(
    validatedInput.additionIngredients,
    "addition_candidate",
    validatedIngredients.length
  );

  return {
    projectId: validatedInput.projectId,
    title,
    summary: normalizeRecipeEditorText(validatedInput.summary) ?? "",
    servingsCount,
    servingsLabel,
    totalTimeMinutes,
    totalTimeLabel,
    coverImageUrl: normalizeRecipeEditorText(validatedInput.coverImageUrl),
    coverStyle: resolveRecipeCoverStyle(title),
    note: normalizeRecipeEditorText(validatedInput.note),
    tags: normalizeTags(validatedInput.tags),
    ingredients: [...validatedIngredients, ...additionIngredients],
    steps: normalizeSteps(validatedInput.steps),
  };
};
