"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Badge from "@/shared/design-system/badge";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
} from "@/modules/recipes/core/domain/recipe.types";
import { usePromoteRecipeAddition } from "@/modules/recipes/presentation/hooks";

type Props = {
  projectId: string;
  recipe: CatalogRecipeDetail;
  editHref: string;
  shoppingHref: string;
};

const RecipeDetailSummaryCard = ({
  projectId,
  recipe,
  editHref,
  shoppingHref,
}: Props) => {
  const router = useRouter();
  const promoteAdditionMutation = usePromoteRecipeAddition();
  const [keptTemporaryIds, setKeptTemporaryIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const validatedIngredients = recipe.ingredients.filter(
    (ingredient) => !isAdditionCandidateIngredient(ingredient)
  );
  const additionIngredients = recipe.ingredients.filter((ingredient) =>
    isAdditionCandidateIngredient(ingredient)
  );

  const shoppingContinuityCopy = recipe.isInQuickList
    ? "Tant qu'un ajout reste temporaire, il reste visible dans la shopping list."
    : "L'ajout reste temporaire dans la recette et reviendra dans les courses si cette recette redevient active.";

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
      <div className={styles["recipes-scaffold__stack"]}>
        <div className={styles["recipes-scaffold__stack"]}>
          <p className={styles["recipes-scaffold__panel-copy"]}>
            La fiche garde l&apos;intention preview: ingredients valides,
            ajouts a tester et etapes restent lisibles sans changer d&apos;ecran.
          </p>
          <p className={styles["recipes-scaffold__helper"]}>
            {recipe.isInQuickList
              ? "Cette recette est active dans la quick list: les ajouts temporaires ont deja un impact sur les courses."
              : "Cette recette n'est pas active pour le moment, mais ses ajouts temporaires restent attaches a la recette."}
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
        </div>

        <div className={styles["recipes-scaffold__metric-grid"]}>
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>
              {recipe.servingsLabel || "-"}
            </span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              portions prevues pour cette recette.
            </span>
          </div>
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>
              {recipe.totalTimeLabel || "-"}
            </span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              temps estime pour reprendre la recette sans surprise.
            </span>
          </div>
        </div>

        <section className={styles["recipes-scaffold__detail-section"]}>
          <div className={styles["recipes-scaffold__detail-section-head"]}>
            <h3 className={styles["recipes-scaffold__section-title"]}>
              Ingredients valides
            </h3>
            <span className={styles["recipes-scaffold__helper"]}>
              {validatedIngredients.length} ligne
              {validatedIngredients.length > 1 ? "s" : ""}
            </span>
          </div>
          {validatedIngredients.length === 0 ? (
            <div className={styles["recipes-scaffold__empty"]}>
              <p className={styles["recipes-scaffold__helper"]}>
                Aucun ingredient valide pour l&apos;instant.
              </p>
            </div>
          ) : (
            <ul className={styles["recipes-scaffold__detail-list"]}>
              {validatedIngredients.map((ingredient) => (
                <li key={ingredient.id}>
                  <span className={styles["recipes-scaffold__detail-list-label"]}>
                    {formatRecipeIngredientLabel(ingredient)}
                  </span>
                  {ingredient.notes ? (
                    <span className={styles["recipes-scaffold__detail-list-note"]}>
                      {ingredient.notes}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className={[
            styles["recipes-scaffold__detail-section"],
            styles["recipes-scaffold__detail-section--addition"],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles["recipes-scaffold__detail-section-head"]}>
            <h3 className={styles["recipes-scaffold__section-title"]}>
              Ajouts a tester
            </h3>
            <Badge
              label={
                recipe.isInQuickList
                  ? "Inclus dans les courses"
                  : "Temporaire"
              }
              variant={recipe.isInQuickList ? "warning" : "default"}
              size="small"
            />
          </div>

          <p className={styles["recipes-scaffold__helper"]}>
            {shoppingContinuityCopy}
          </p>

          {additionIngredients.length === 0 ? (
            <div className={styles["recipes-scaffold__empty"]}>
              <p className={styles["recipes-scaffold__helper"]}>
                Aucun ajout temporaire a arbitrer pour le moment.
              </p>
            </div>
          ) : (
            <div className={styles["recipes-scaffold__summary-list"]}>
              {additionIngredients.map((ingredient) => {
                const isPendingCurrentIngredient =
                  promoteAdditionMutation.isPending &&
                  promoteAdditionMutation.variables?.ingredientId ===
                    ingredient.id;

                return (
                  <article
                    key={ingredient.id}
                    className={styles["recipes-scaffold__detail-addition-card"]}
                  >
                    <div className={styles["recipes-scaffold__detail-addition-copy"]}>
                      <div className={styles["recipes-scaffold__shopping-item-top"]}>
                        <h4 className={styles["recipes-scaffold__shopping-group-title"]}>
                          {formatRecipeIngredientLabel(ingredient)}
                        </h4>
                        <span className={styles["recipes-scaffold__pill"]}>
                          Ajout
                        </span>
                      </div>
                      {ingredient.notes ? (
                        <p className={styles["recipes-scaffold__shopping-item-note"]}>
                          {ingredient.notes}
                        </p>
                      ) : null}
                      <p className={styles["recipes-scaffold__helper"]}>
                        {shoppingContinuityCopy}
                      </p>
                      {keptTemporaryIds.includes(ingredient.id) ? (
                        <p className={styles["recipes-scaffold__note"]}>
                          Rien ne change: cet ajout reste temporaire.
                        </p>
                      ) : null}
                    </div>

                    <div className={styles["recipes-scaffold__detail-addition-actions"]}>
                      <Button
                        label={
                          isPendingCurrentIngredient
                            ? "Validation..."
                            : "Valider cet ajout"
                        }
                        disabled={promoteAdditionMutation.isPending}
                        onClick={async () => {
                          setActionError(null);
                          setKeptTemporaryIds((currentIds) =>
                            currentIds.filter((id) => id !== ingredient.id)
                          );

                          try {
                            await promoteAdditionMutation.mutateAsync({
                              projectId,
                              recipeId: recipe.id,
                              ingredientId: ingredient.id,
                            });
                            router.refresh();
                          } catch {
                            setActionError(
                              "La validation de l'ajout a echoue. Reessayez."
                            );
                          }
                        }}
                      />
                      <Button
                        label="Laisser temporaire"
                        variant="secondary"
                        disabled={promoteAdditionMutation.isPending}
                        onClick={() => {
                          setActionError(null);
                          setKeptTemporaryIds((currentIds) => {
                            if (currentIds.includes(ingredient.id)) {
                              return currentIds;
                            }

                            return [...currentIds, ingredient.id];
                          });
                        }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles["recipes-scaffold__detail-section"]}>
          <div className={styles["recipes-scaffold__detail-section-head"]}>
            <h3 className={styles["recipes-scaffold__section-title"]}>
              Etapes
            </h3>
            <span className={styles["recipes-scaffold__helper"]}>
              {recipe.steps.length} etape{recipe.steps.length > 1 ? "s" : ""}
            </span>
          </div>

          {recipe.steps.length === 0 ? (
            <div className={styles["recipes-scaffold__empty"]}>
              <p className={styles["recipes-scaffold__helper"]}>
                Aucune etape pour l&apos;instant.
              </p>
            </div>
          ) : (
            <div className={styles["recipes-scaffold__step-list"]}>
              {recipe.steps.map((step) => (
                <article
                  key={step.id}
                  className={styles["recipes-scaffold__step-card"]}
                >
                  <div className={styles["recipes-scaffold__step-head"]}>
                    <span className={styles["recipes-scaffold__step-label"]}>
                      Etape {step.position}
                    </span>
                    {step.meta ? (
                      <span className={styles["recipes-scaffold__step-meta"]}>
                        {step.meta}
                      </span>
                    ) : null}
                  </div>
                  <p className={styles["recipes-scaffold__step-copy"]}>
                    {step.instruction}
                  </p>
                  {step.notes ? (
                    <p className={styles["recipes-scaffold__shopping-item-note"]}>
                      {step.notes}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        {actionError ? (
          <p className={styles["recipes-scaffold__error"]}>{actionError}</p>
        ) : null}
      </div>
    </Card>
  );
};

export default RecipeDetailSummaryCard;
