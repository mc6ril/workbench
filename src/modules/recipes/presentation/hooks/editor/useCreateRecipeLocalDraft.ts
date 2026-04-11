"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  UseFormGetValues,
  UseFormReset,
  UseFormWatch,
} from "react-hook-form";
import { z } from "zod";

import { STORAGE_KEYS } from "@/shared/constants/app";

import {
  normalizeRecipeEditorText,
  normalizeRecipeTagLabel,
} from "@/modules/recipes/core/domain/editor/recipeEditor.helpers";
import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";

const AUTOSAVE_DELAY_MS = 800;

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

const CreateRecipeLocalDraftSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  values: z.object({
    projectId: z.string(),
    title: z.string(),
    summary: z.string(),
    servingsCount: z.string(),
    totalTimeMinutes: z.string(),
    coverImageUrl: z.string(),
    note: z.string(),
    tags: z.array(RecipeEditorTagInputSchema),
    validatedIngredients: z.array(RecipeEditorIngredientInputSchema),
    additionIngredients: z.array(RecipeEditorIngredientInputSchema),
    steps: z.array(RecipeEditorStepInputSchema),
  }),
});

const hasText = (value?: string | null) => {
  return Boolean(normalizeRecipeEditorText(value));
};

const hasTagContent = (tag: SaveRecipeEditorInput["tags"][number]) => {
  return Boolean(normalizeRecipeTagLabel(tag.label));
};

const hasIngredientContent = (
  ingredient: SaveRecipeEditorInput["validatedIngredients"][number]
) => {
  return (
    hasText(ingredient.amount) ||
    hasText(ingredient.unit) ||
    hasText(ingredient.displayName) ||
    hasText(ingredient.notes)
  );
};

const hasStepContent = (step: SaveRecipeEditorInput["steps"][number]) => {
  return hasText(step.instruction) || hasText(step.meta);
};

const hasLocalDraftContent = (values: SaveRecipeEditorInput) => {
  return (
    hasText(values.title) ||
    hasText(values.summary) ||
    hasText(values.servingsCount) ||
    hasText(values.totalTimeMinutes) ||
    hasText(values.coverImageUrl) ||
    hasText(values.note) ||
    values.tags.some(hasTagContent) ||
    values.validatedIngredients.some(hasIngredientContent) ||
    values.additionIngredients.some(hasIngredientContent) ||
    values.steps.some(hasStepContent)
  );
};

export const getCreateRecipeLocalDraftStorageKey = (projectId: string) => {
  return `${STORAGE_KEYS.RECIPE_EDITOR_CREATE_DRAFT_PREFIX}:${projectId}`;
};

export const readCreateRecipeLocalDraft = (
  projectId: string
): SaveRecipeEditorInput | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = getCreateRecipeLocalDraftStorageKey(projectId);
  const persistedValue = window.localStorage.getItem(storageKey);

  if (!persistedValue) {
    return null;
  }

  try {
    const parsedDraft = CreateRecipeLocalDraftSchema.parse(
      JSON.parse(persistedValue)
    );

    if (parsedDraft.values.projectId !== projectId) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsedDraft.values;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const clearCreateRecipeLocalDraft = (projectId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    getCreateRecipeLocalDraftStorageKey(projectId)
  );
};

export const saveCreateRecipeLocalDraft = (values: SaveRecipeEditorInput) => {
  if (typeof window === "undefined") {
    return false;
  }

  const storageKey = getCreateRecipeLocalDraftStorageKey(values.projectId);

  if (!hasLocalDraftContent(values)) {
    window.localStorage.removeItem(storageKey);
    return false;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        values,
      })
    );
    return true;
  } catch {
    return false;
  }
};

type UseCreateRecipeLocalDraftParams = {
  enabled: boolean;
  projectId: string;
  reset: UseFormReset<SaveRecipeEditorInput>;
  watch: UseFormWatch<SaveRecipeEditorInput>;
  getValues: UseFormGetValues<SaveRecipeEditorInput>;
};

export const useCreateRecipeLocalDraft = ({
  enabled,
  projectId,
  reset,
  watch,
  getValues,
}: UseCreateRecipeLocalDraftParams) => {
  const saveTimeoutRef = useRef<number | null>(null);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      isHydratedRef.current = false;
      return;
    }

    const restoredDraft = readCreateRecipeLocalDraft(projectId);

    if (restoredDraft) {
      reset(restoredDraft);
    }

    isHydratedRef.current = true;
  }, [enabled, projectId, reset]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = watch(() => {
      if (!isHydratedRef.current) {
        return;
      }

      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        saveCreateRecipeLocalDraft(getValues());
      }, AUTOSAVE_DELAY_MS);
    });

    return () => {
      subscription.unsubscribe();

      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [enabled, getValues, watch]);

  const clearDraft = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    clearCreateRecipeLocalDraft(projectId);
  }, [projectId]);

  return {
    clearDraft,
  };
};
