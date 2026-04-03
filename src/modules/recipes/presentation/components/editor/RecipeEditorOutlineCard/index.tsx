import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import { isAdditionCandidateIngredient } from "@/modules/recipes/core/domain/recipe.types";

type Props = {
  href: string;
  mode: "create" | "edit";
  draft: RecipeDraft;
  ctaLabel?: string;
};

const getFieldValue = (value: string | null | undefined, fallback: string) => {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value;
};

const RecipeEditorOutlineCard = ({
  href,
  mode,
  draft,
  ctaLabel,
}: Props) => {
  const isCreate = mode === "create";

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            {isCreate ? "Creation" : "Edition"}
          </p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {isCreate
              ? "Format d'ingredients deja fixe pour la creation"
              : "La meme structure sert l'edition et les futures courses"}
          </h2>
        </div>
      }
      footer={
        <Link href={href}>
          {ctaLabel ??
            (isCreate ? "Retour au catalogue" : "Ouvrir la shopping list")}
        </Link>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        Une ligne d&apos;ingredient garde toujours un nom visible, un nom
        normalise, une quantite, une unite et une note. La page reste legere,
        mais elle montre deja la vraie structure de l&apos;etape 4.
      </p>

      <div className={styles["recipes-scaffold__field-grid"]}>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Titre</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            {getFieldValue(
              draft.title,
              isCreate ? "Titre a definir" : "Recette"
            )}
          </p>
        </div>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Portions</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            {getFieldValue(
              draft.servingsLabel,
              isCreate ? "A definir" : "Sans portions"
            )}
          </p>
        </div>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>
            Temps estime
          </p>
          <p className={styles["recipes-scaffold__field-value"]}>
            {getFieldValue(draft.totalTimeLabel, "A estimer")}
          </p>
        </div>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Image</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            {draft.coverImageUrl ? "Image renseignee" : "Optionnelle"}
          </p>
        </div>
      </div>

      <div className={styles["recipes-scaffold__editor-section"]}>
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Tags</p>
          <h3 className={styles["recipes-scaffold__section-title"]}>
            Lecture rapide, sans back-office
          </h3>
        </div>

        <div className={styles["recipes-scaffold__pill-row"]}>
          {draft.tags.map((tag) => (
            <span key={tag.id} className={styles["recipes-scaffold__pill"]}>
              {tag.label}
            </span>
          ))}
          {draft.tags.length === 0 ? (
            <span className={styles["recipes-scaffold__pill"]}>
              Aucun tag pour l&apos;instant
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles["recipes-scaffold__editor-section"]}>
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Ingredients
          </p>
          <h3 className={styles["recipes-scaffold__section-title"]}>
            Quantite, unite, nom visible et note restent separes
          </h3>
        </div>

        <div className={styles["recipes-scaffold__ingredient-table"]}>
          <div className={styles["recipes-scaffold__ingredient-table-head"]}>
            <span>Statut</span>
            <span>Quantite</span>
            <span>Unite</span>
            <span>Ingredient</span>
            <span>Note</span>
          </div>

          {draft.ingredients.map((ingredient) => {
            const isAddition = isAdditionCandidateIngredient(ingredient);

            return (
              <div
                key={ingredient.id}
                className={[
                  styles["recipes-scaffold__ingredient-row"],
                  isAddition &&
                    styles["recipes-scaffold__ingredient-row--addition"],
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    styles["recipes-scaffold__ingredient-status"],
                    isAddition &&
                      styles["recipes-scaffold__ingredient-status--addition"],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isAddition ? "Ajout" : "Valide"}
                </span>
                <span className={styles["recipes-scaffold__ingredient-cell"]}>
                  {ingredient.amountText ?? "A definir"}
                </span>
                <span className={styles["recipes-scaffold__ingredient-cell"]}>
                  {ingredient.unit ?? "Sans unite"}
                </span>
                <span className={styles["recipes-scaffold__ingredient-cell"]}>
                  {ingredient.displayName}
                </span>
                <span className={styles["recipes-scaffold__ingredient-cell"]}>
                  {ingredient.notes ?? "Aucune note"}
                </span>
              </div>
            );
          })}
        </div>

        <p className={styles["recipes-scaffold__helper"]}>
          Les quantites simples restent structurees. Si la saisie n&apos;entre
          pas dans `2`, `2.5` ou `1/2`, on garde le texte tel quel sans
          supposer une interpretation fragile.
        </p>
      </div>

      <div className={styles["recipes-scaffold__editor-section"]}>
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Etapes</p>
          <h3 className={styles["recipes-scaffold__section-title"]}>
            Blocs courts et faciles a relire
          </h3>
        </div>

        <div className={styles["recipes-scaffold__step-list"]}>
          {draft.steps.map((step) => (
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
            </article>
          ))}
        </div>
      </div>

      {draft.note ? (
        <div className={styles["recipes-scaffold__editor-note"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Retour apres test
          </p>
          <p className={styles["recipes-scaffold__panel-copy"]}>{draft.note}</p>
        </div>
      ) : null}
    </Card>
  );
};

export default RecipeEditorOutlineCard;
