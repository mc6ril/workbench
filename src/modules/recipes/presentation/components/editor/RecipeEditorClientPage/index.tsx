"use client";

import {
  type ChangeEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { APP_LIMITS } from "@/shared/constants/app";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import CloseButton from "@/shared/design-system/close_button";
import ErrorMessage from "@/shared/design-system/error_message";
import Form from "@/shared/design-system/form";
import Input from "@/shared/design-system/input";
import SectionTitle from "@/shared/design-system/section_title";
import Select from "@/shared/design-system/select";
import Text from "@/shared/design-system/text";
import Textarea from "@/shared/design-system/textarea";
import { useTranslation } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import styles from "./styles.module.scss";

import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import {
  buildRecipeTagSlug,
  normalizeRecipeTagLabel,
} from "@/modules/recipes/core/domain/editor/recipeEditor.helpers";
import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import {
  RECIPE_INGREDIENT_UNIT_VALUES,
  type RecipeTag,
} from "@/modules/recipes/core/domain/recipe.types";
import { RecipeEditorSubmissionSchema } from "@/modules/recipes/core/usecases/editor/saveRecipe";
import { useCreateRecipe } from "@/modules/recipes/presentation/hooks/editor/useCreateRecipe";
import { useUpdateRecipe } from "@/modules/recipes/presentation/hooks/editor/useUpdateRecipe";
import { useUploadRecipeCover } from "@/modules/recipes/presentation/hooks/editor/useUploadRecipeCover";
import {
  buildRecipeDetailRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  mode: "create" | "edit";
  draft: RecipeDraft;
  availableTags: RecipeTag[];
};

type SectionHeadingProps = {
  title: string;
};

type MetaBadgeProps = {
  label: string;
  value: string;
  tone?: "default" | "accent" | "muted";
};

type IngredientSectionProps = {
  sectionKey: "validatedIngredients" | "additionIngredients";
  sectionHeading: SectionHeadingProps;
  emptyCopy: string;
  addLabel: string;
  nameLabel: string;
  itemLabel: string;
  fields: Array<{
    id: string;
  }>;
  ingredientErrors: unknown;
  appendIngredient: () => void;
  moveIngredient: (from: number, to: number) => void;
  removeIngredient: (index: number) => void;
  register: ReturnType<typeof useForm<SaveRecipeEditorInput>>["register"];
  ingredientUnitOptions: Array<{
    value: string;
    label: string;
  }>;
  isPending: boolean;
  t: ReturnType<typeof useTranslation>;
};

type IngredientRowError = {
  amount?: {
    message?: string;
  };
  unit?: {
    message?: string;
  };
  displayName?: {
    message?: string;
  };
  notes?: {
    message?: string;
  };
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

const RECIPE_COVER_ACCEPT = APP_LIMITS.RECIPE_COVER.ALLOWED_MIME_TYPES.join(
  ","
);
const RECIPE_COVER_ALLOWED_MIME_TYPES = new Set<string>(
  APP_LIMITS.RECIPE_COVER.ALLOWED_MIME_TYPES
);

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

const resizeTextarea = (element: HTMLTextAreaElement | null) => {
  if (!element) {
    return;
  }

  element.style.height = "0";
  element.style.height = `${element.scrollHeight}px`;
};

const SectionHeading = ({ title }: SectionHeadingProps) => {
  return (
    <div className={styles["editor-section-heading"]}>
      <SectionTitle>{title}</SectionTitle>
    </div>
  );
};

const MetaBadge = ({
  label,
  value,
  tone = "default",
}: MetaBadgeProps) => {
  return (
    <div
      className={[
        styles["editor-meta-badge"],
        tone !== "default" ? styles[`editor-meta-badge--${tone}`] : null,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="span"
        variant="caption"
        className={styles["editor-meta-label"]}
      >
        {label}
      </Text>
      <Text as="span" variant="small" className={styles["editor-meta-value"]}>
        {value}
      </Text>
    </div>
  );
};

const IngredientSection = ({
  sectionKey,
  sectionHeading,
  emptyCopy,
  addLabel,
  nameLabel,
  itemLabel,
  fields,
  ingredientErrors,
  appendIngredient,
  moveIngredient,
  removeIngredient,
  register,
  ingredientUnitOptions,
  isPending,
  t,
}: IngredientSectionProps) => {
  const ingredientRowErrors = Array.isArray(ingredientErrors)
    ? (ingredientErrors as Array<IngredientRowError | undefined>)
    : [];

  return (
    <section className={styles["editor-main-section"]}>
      <SectionHeading {...sectionHeading} />

      {getFieldMessage(ingredientErrors) ? (
        <ErrorMessage
          message={getFieldMessage(ingredientErrors) ?? ""}
          className={styles["editor-form-error"]}
        />
      ) : null}

      {fields.length === 0 ? (
        <div className={styles["editor-empty-state"]}>
          <Text variant="body" className={styles["editor-empty-copy"]}>
            {emptyCopy}
          </Text>
        </div>
      ) : null}

      <div className={styles["editor-item-list"]}>
        {fields.map((field, index) => {
          const rowErrors = ingredientRowErrors[index];
          const rowLabel = t(`sections.${sectionKey}.rowLabel`, {
            position: index + 1,
          });

          return (
            <div key={field.id} className={styles["editor-item-card"]}>
              <div className={styles["editor-item-head"]}>
                <span className={styles["editor-item-index"]}>{rowLabel}</span>

                <div className={styles["editor-controls"]}>
                  <Button
                    label={t("actions.moveUpItemAriaLabel", {
                      label: itemLabel,
                      position: index + 1,
                    })}
                    variant="ghost"
                    onClick={() => moveIngredient(index, index - 1)}
                    disabled={isPending || index === 0}
                  >
                    {t("actions.moveUp")}
                  </Button>
                  <Button
                    label={t("actions.moveDownItemAriaLabel", {
                      label: itemLabel,
                      position: index + 1,
                    })}
                    variant="ghost"
                    onClick={() => moveIngredient(index, index + 1)}
                    disabled={isPending || index === fields.length - 1}
                  >
                    {t("actions.moveDown")}
                  </Button>
                  <Button
                    label={t("actions.removeItemAriaLabel", {
                      label: itemLabel,
                      position: index + 1,
                    })}
                    variant="ghost"
                    onClick={() => removeIngredient(index)}
                    disabled={isPending}
                  >
                    {t("actions.remove")}
                  </Button>
                </div>
              </div>

              <div
                className={`${styles["editor-grid"]} ${styles["editor-grid--ingredient"]}`}
              >
                <Input
                  label={t("fields.ingredientAmount.label")}
                  error={rowErrors?.amount?.message}
                  disabled={isPending}
                  {...register(`${sectionKey}.${index}.amount` as const)}
                />
                <Select
                  label={t("fields.ingredientUnit.label")}
                  options={ingredientUnitOptions}
                  error={rowErrors?.unit?.message}
                  disabled={isPending}
                  {...register(`${sectionKey}.${index}.unit` as const)}
                />
                <Input
                  label={nameLabel}
                  error={rowErrors?.displayName?.message}
                  disabled={isPending}
                  {...register(`${sectionKey}.${index}.displayName` as const)}
                />
                <input type="hidden" {...register(`${sectionKey}.${index}.notes` as const)} />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles["editor-section-footer"]}>
        <Button
          label={addLabel}
          variant="secondary"
          onClick={appendIngredient}
          disabled={isPending}
        />
      </div>
    </section>
  );
};

const RecipeEditorClientPage = ({
  projectId,
  mode,
  draft,
  availableTags,
}: Props) => {
  const t = useTranslation("pages.recipes.editor");
  const isCreate = mode === "create";
  const router = useAppRouter();
  const [tagDraft, setTagDraft] = useState("");
  const [isRouting, startRouting] = useTransition();
  const titleTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverUploadInputRef = useRef<HTMLInputElement | null>(null);
  const createRecipeMutation = useCreateRecipe();
  const coverUploadMutation = useUploadRecipeCover();
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
    setValue,
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
    coverUploadMutation.isPending ||
    updateRecipeMutation.isPending ||
    isRouting;

  const titleField = register("title");

  useLayoutEffect(() => {
    resizeTextarea(titleTextareaRef.current);
  }, [watchedTitle]);

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
      ? t("meta.servingsWithCount", {
          count: watchedServingsCount,
        })
      : t("meta.servingsFallback"));
  const resolvedTimeLabel = normalizeRecipeTagLabel(watchedTotalTimeMinutes)
    ? t("meta.timeWithCount", {
        count: watchedTotalTimeMinutes,
      })
    : t("meta.timeFallback");
  const resolvedImageLabel = normalizeRecipeTagLabel(watchedCoverImageUrl)
    ? t("meta.imageReady")
    : t("meta.imageEmpty");
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
  const backHref = isCreate
    ? buildRecipesCatalogRoute(projectId)
    : buildRecipeDetailRoute(projectId, draft.id ?? "");
  const ingredientUnitOptions = useMemo(
    () => [
      {
        value: "",
        label: t("fields.ingredientUnit.options.none"),
      },
      ...RECIPE_INGREDIENT_UNIT_VALUES.map((unit) => ({
        value: unit,
        label: t(`fields.ingredientUnit.options.${unit}`),
      })),
    ],
    [t]
  );
  const coverImageFieldId = getAccessibilityId("recipe-cover-image-url");
  const coverImageFieldHintId = getAccessibilityId("recipe-cover-image-url-hint");
  const coverImageFieldErrorId = getAccessibilityId(
    "recipe-cover-image-url-error"
  );
  const coverImageFieldDescribedBy = errors.coverImageUrl?.message
    ? coverImageFieldErrorId
    : coverImageFieldHintId;

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

  const handleTriggerCoverUpload = useCallback(() => {
    coverUploadInputRef.current?.click();
  }, []);

  const handleCloseEditor = useCallback(() => {
    router.push(backHref);
  }, [backHref, router]);

  const handleCoverFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      event.target.value = "";

      if (!file) {
        return;
      }

      if (file.size > APP_LIMITS.RECIPE_COVER.MAX_INPUT_SIZE_BYTES) {
        setError("coverImageUrl", {
          type: "server",
          message: t("errors.coverUploadTooLarge"),
        });
        return;
      }

      if (!RECIPE_COVER_ALLOWED_MIME_TYPES.has(file.type)) {
        setError("coverImageUrl", {
          type: "server",
          message: t("errors.coverUploadInvalidType"),
        });
        return;
      }

      clearErrors("coverImageUrl");

      try {
        const uploadedCoverUrl = await coverUploadMutation.mutateAsync({
          projectId,
          file,
        });

        setValue("coverImageUrl", uploadedCoverUrl, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        clearErrors("coverImageUrl");
      } catch {
        setError("coverImageUrl", {
          type: "server",
          message: t("errors.coverUploadFailed"),
        });
      }
    },
    [clearErrors, coverUploadMutation, projectId, setError, setValue, t]
  );

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
          message: t("errors.missingId"),
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
        message: t("errors.saveFailed"),
      });
    }
  });

  const metaBadges: MetaBadgeProps[] = [
    {
      label: t("meta.servings"),
      value: resolvedServingsLabel,
      tone: normalizeRecipeTagLabel(watchedServingsCount) ? "accent" : "muted",
    },
    {
      label: t("meta.time"),
      value: resolvedTimeLabel,
      tone: normalizeRecipeTagLabel(watchedTotalTimeMinutes)
        ? "accent"
        : "muted",
    },
    {
      label: t("meta.image"),
      value: resolvedImageLabel,
      tone: normalizeRecipeTagLabel(watchedCoverImageUrl) ? "accent" : "muted",
    },
    {
      label: t("meta.tags"),
      value: String(watchedTags.length),
    },
    {
      label: t("meta.validatedIngredients"),
      value: String(nonBlankValidatedIngredients.length),
    },
    {
      label: t("meta.additionIngredients"),
      value: String(nonBlankAdditionIngredients.length),
    },
    {
      label: t("meta.steps"),
      value: String(nonBlankSteps.length),
    },
  ];

  return (
    <div className={styles["editor-layout"]}>
      <Form
        onSubmit={onSubmit}
        className={styles["editor-form"]}
        error={getFieldMessage(errors.root)}
      >
        <input type="hidden" {...register("projectId")} />

        <div className={styles["editor-form-shell"]}>
          <header className={styles["editor-header"]}>
            <div className={styles["editor-header-top"]}>
              <span className={styles["editor-header-mode"]}>
                {isCreate ? t("header.createMode") : t("header.editMode")}
              </span>
              <CloseButton
                ariaLabel={t("actions.close")}
                onClick={handleCloseEditor}
              />
            </div>

            <textarea
              ref={(element) => {
                titleField.ref(element);
                titleTextareaRef.current = element;
              }}
              rows={1}
              name={titleField.name}
              onBlur={titleField.onBlur}
              onChange={titleField.onChange}
              onInput={(event) => {
                resizeTextarea(event.currentTarget);
              }}
              placeholder={t("fields.title.placeholder")}
              aria-label={t("fields.title.label")}
              aria-invalid={errors.title ? "true" : "false"}
              disabled={isPending}
              className={[
                styles["editor-title-input"],
                errors.title && styles["editor-title-input--error"],
              ]
                .filter(Boolean)
                .join(" ")}
            />

            {errors.title?.message ? (
              <Text variant="small" className={styles["editor-title-error"]}>
                {errors.title.message}
              </Text>
            ) : null}

            <div className={styles["editor-meta-bar"]}>
              {metaBadges.map((item) => (
                <MetaBadge
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>
          </header>

          <Card variant="outlined" className={styles["editor-main-card"]}>
            <section className={styles["editor-main-section"]}>
              <SectionHeading title={t("sections.identity.kicker")} />

              <div
                className={`${styles["editor-grid"]} ${styles["editor-grid--details"]}`}
              >
                <div className={styles["editor-cover-field"]}>
                  <label
                    htmlFor={coverImageFieldId}
                    className={styles["editor-cover-label"]}
                  >
                    {t("fields.coverImageUrl.label")}
                  </label>
                  <div className={styles["editor-cover-controls"]}>
                    <div className={styles["editor-cover-input"]}>
                      <Input
                        id={coverImageFieldId}
                        type="url"
                        placeholder={t("fields.coverImageUrl.placeholder")}
                        aria-describedby={coverImageFieldDescribedBy}
                        disabled={isPending}
                        {...register("coverImageUrl")}
                      />
                    </div>
                    <div className={styles["editor-upload-actions"]}>
                      <input
                        ref={coverUploadInputRef}
                        type="file"
                        accept={RECIPE_COVER_ACCEPT}
                        className={styles["editor-upload-input"]}
                        aria-label={t("actions.uploadCover")}
                        disabled={isPending}
                        onChange={handleCoverFileChange}
                      />
                      <Button
                        label={
                          coverUploadMutation.isPending
                            ? t("actions.uploadingCover")
                            : normalizeRecipeTagLabel(watchedCoverImageUrl)
                              ? t("actions.replaceCover")
                              : t("actions.uploadCover")
                        }
                        variant="secondary"
                        onClick={handleTriggerCoverUpload}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  {errors.coverImageUrl?.message ? (
                    <Text
                      id={coverImageFieldErrorId}
                      variant="small"
                      className={styles["editor-cover-error"]}
                    >
                      {errors.coverImageUrl.message}
                    </Text>
                  ) : (
                    <Text
                      id={coverImageFieldHintId}
                      variant="small"
                      className={styles["editor-cover-hint"]}
                    >
                      {t("fields.coverImageUrl.helper")}
                    </Text>
                  )}
                </div>
                <Input
                  label={t("fields.servingsCount.label")}
                  type="number"
                  inputMode="numeric"
                  placeholder={t("fields.servingsCount.placeholder")}
                  error={errors.servingsCount?.message}
                  disabled={isPending}
                  {...register("servingsCount")}
                />
                <Input
                  label={t("fields.servingsLabel.label")}
                  placeholder={t("fields.servingsLabel.placeholder")}
                  helperText={t("fields.servingsLabel.helper")}
                  error={errors.servingsLabel?.message}
                  disabled={isPending}
                  {...register("servingsLabel")}
                />
                <Input
                  label={t("fields.totalTimeMinutes.label")}
                  type="number"
                  inputMode="numeric"
                  placeholder={t("fields.totalTimeMinutes.placeholder")}
                  helperText={t("fields.totalTimeMinutes.helper")}
                  error={errors.totalTimeMinutes?.message}
                  disabled={isPending}
                  {...register("totalTimeMinutes")}
                />
              </div>

              <Textarea
                label={t("fields.summary.label")}
                rows={4}
                resize="vertical"
                error={errors.summary?.message}
                disabled={isPending}
                {...register("summary")}
              />
            </section>

            <section className={styles["editor-main-section"]}>
              <SectionHeading title={t("sections.tags.kicker")} />

              {tagFields.length > 0 ? (
                <div className={styles["editor-pill-row"]}>
                  {tagFields.map((tag, index) => (
                    <span key={tag.id} className={styles["editor-pill"]}>
                      {tag.label}
                      <button
                        type="button"
                        className={styles["editor-pill-remove"]}
                        onClick={() => removeTag(index)}
                        disabled={isPending}
                        aria-label={t("actions.removeTagAriaLabel", {
                          label: tag.label,
                        })}
                      >
                        {t("actions.remove")}
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              {getFieldMessage(errors.tags) ? (
                <ErrorMessage
                  message={getFieldMessage(errors.tags) ?? ""}
                  className={styles["editor-form-error"]}
                />
              ) : null}

              <div className={styles["editor-inline-form"]}>
                <Input
                  label={t("fields.tagDraft.label")}
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  placeholder={t("fields.tagDraft.placeholder")}
                  disabled={isPending}
                />
                <div className={styles["editor-actions"]}>
                  <Button
                    label={t("actions.addTag")}
                    variant="secondary"
                    onClick={() => handleAddTag(tagDraft)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {remainingTagSuggestions.length > 0 ? (
                <div className={styles["editor-suggestion-row"]}>
                  {remainingTagSuggestions.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={styles["editor-suggestion"]}
                      onClick={() => handleAddTag(tag.label)}
                      disabled={isPending}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <IngredientSection
              sectionKey="validatedIngredients"
              sectionHeading={{
                title: t("sections.validatedIngredients.kicker"),
              }}
              emptyCopy={t("sections.validatedIngredients.empty")}
              addLabel={t("actions.addValidatedIngredient")}
              nameLabel={t("sections.validatedIngredients.nameLabel")}
              itemLabel={t("labels.validatedIngredient")}
              fields={validatedIngredientFields}
              ingredientErrors={errors.validatedIngredients}
              appendIngredient={() =>
                appendValidatedIngredient(createEmptyIngredientRow())
              }
              moveIngredient={moveValidatedIngredient}
              removeIngredient={removeValidatedIngredient}
              register={register}
              ingredientUnitOptions={ingredientUnitOptions}
              isPending={isPending}
              t={t}
            />

            <IngredientSection
              sectionKey="additionIngredients"
              sectionHeading={{
                title: t("sections.additionIngredients.kicker"),
              }}
              emptyCopy={t("sections.additionIngredients.empty")}
              addLabel={t("actions.addAdditionIngredient")}
              nameLabel={t("sections.additionIngredients.nameLabel")}
              itemLabel={t("labels.validatedIngredient")}
              fields={additionIngredientFields}
              ingredientErrors={errors.additionIngredients}
              appendIngredient={() =>
                appendAdditionIngredient(createEmptyIngredientRow())
              }
              moveIngredient={moveAdditionIngredient}
              removeIngredient={removeAdditionIngredient}
              register={register}
              ingredientUnitOptions={ingredientUnitOptions}
              isPending={isPending}
              t={t}
            />

            <section className={styles["editor-main-section"]}>
              <SectionHeading title={t("sections.steps.kicker")} />

              {getFieldMessage(errors.steps) ? (
                <ErrorMessage
                  message={getFieldMessage(errors.steps) ?? ""}
                  className={styles["editor-form-error"]}
                />
              ) : null}

              {stepFields.length === 0 ? (
                <div className={styles["editor-empty-state"]}>
                  <Text variant="body" className={styles["editor-empty-copy"]}>
                    {t("sections.steps.empty")}
                  </Text>
                </div>
              ) : null}

              <div className={styles["editor-item-list"]}>
                {stepFields.map((field, index) => {
                  const rowErrors = errors.steps?.[index];

                  return (
                    <div key={field.id} className={styles["editor-item-card"]}>
                      <div className={styles["editor-item-head"]}>
                        <span className={styles["editor-item-index"]}>
                          {t("sections.steps.rowLabel", {
                            position: index + 1,
                          })}
                        </span>

                        <div className={styles["editor-controls"]}>
                          <Button
                            label={t("actions.moveUpItemAriaLabel", {
                              label: t("labels.step"),
                              position: index + 1,
                            })}
                            variant="ghost"
                            onClick={() => moveStep(index, index - 1)}
                            disabled={isPending || index === 0}
                          >
                            {t("actions.moveUp")}
                          </Button>
                          <Button
                            label={t("actions.moveDownItemAriaLabel", {
                              label: t("labels.step"),
                              position: index + 1,
                            })}
                            variant="ghost"
                            onClick={() => moveStep(index, index + 1)}
                            disabled={isPending || index === stepFields.length - 1}
                          >
                            {t("actions.moveDown")}
                          </Button>
                          <Button
                            label={t("actions.removeItemAriaLabel", {
                              label: t("labels.step"),
                              position: index + 1,
                            })}
                            variant="ghost"
                            onClick={() => removeStep(index)}
                            disabled={isPending}
                          >
                            {t("actions.remove")}
                          </Button>
                        </div>
                      </div>

                      <div
                        className={`${styles["editor-grid"]} ${styles["editor-grid--step"]}`}
                      >
                        <Textarea
                          label={t("fields.stepInstruction.label")}
                          rows={4}
                          resize="vertical"
                          placeholder={t("sections.steps.instructionPlaceholder")}
                          error={rowErrors?.instruction?.message}
                          disabled={isPending}
                          {...register(`steps.${index}.instruction` as const)}
                        />
                        <Input
                          label={t("fields.stepMeta.label")}
                          placeholder={t("sections.steps.metaPlaceholder")}
                          error={rowErrors?.meta?.message}
                          disabled={isPending}
                          {...register(`steps.${index}.meta` as const)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles["editor-section-footer"]}>
                <Button
                  label={t("actions.addStep")}
                  variant="secondary"
                  onClick={() => appendStep(createEmptyStepRow())}
                  disabled={isPending}
                />
              </div>
            </section>

            <section className={styles["editor-main-section"]}>
              <SectionHeading title={t("sections.note.kicker")} />

              <Textarea
                label={t("fields.note.label")}
                rows={4}
                resize="vertical"
                error={errors.note?.message}
                disabled={isPending}
                {...register("note")}
              />
            </section>

            <div className={styles["editor-actions-row"]}>
              <Button
                label={
                  isPending
                    ? t("actions.saving")
                    : isCreate
                      ? t("actions.saveCreate")
                      : t("actions.saveEdit")
                }
                variant="save"
                type="submit"
                disabled={isPending}
              />
            </div>
          </Card>
        </div>
      </Form>
    </div>
  );
};

export default RecipeEditorClientPage;
