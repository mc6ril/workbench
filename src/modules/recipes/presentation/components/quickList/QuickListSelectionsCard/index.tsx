"use client";

import Badge from "@/shared/design-system/badge";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import { useListActiveSelections } from "@/modules/recipes/presentation/hooks/planner/listActiveSelections";
import { useMarkAsCooked } from "@/modules/recipes/presentation/hooks/planner/useMarkAsCooked";
import { useMarkShoppingDone } from "@/modules/recipes/presentation/hooks/planner/useMarkShoppingDone";
import { useRemoveSelection } from "@/modules/recipes/presentation/hooks/planner/useRemoveSelection";
import {
  buildRecipeDetailRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  initialSelections: QuickListRecipe[];
};

type SelectionCardProps = {
  projectId: string;
  selection: QuickListRecipe;
  isMutating: boolean;
  primaryAction: React.ReactNode;
  onRemove: () => void;
};

const SelectionCard = ({
  projectId,
  selection,
  isMutating,
  primaryAction,
  onRemove,
}: SelectionCardProps) => (
  <article className={styles["recipes-scaffold__selection-card"]}>
    <div className={styles["recipes-scaffold__summary-copy"]}>
      <div className={styles["recipes-scaffold__summary-head"]}>
        <Link
          href={buildRecipeDetailRoute(projectId, selection.recipeId)}
          prefetch={false}
        >
          {selection.title}
        </Link>
      </div>
      <p className={styles["recipes-scaffold__summary-meta"]}>
        {selection.servingsLabel}
      </p>
    </div>
    <div className={styles["recipes-scaffold__selection-side"]}>
      <div className={styles["recipes-scaffold__actions"]}>
        <Link
          href={buildRecipeDetailRoute(projectId, selection.recipeId)}
          prefetch={false}
        >
          Voir
        </Link>
        {primaryAction}
        <Button
          label="Retirer"
          variant="danger"
          disabled={isMutating}
          onClick={onRemove}
        />
      </div>
    </div>
  </article>
);

const QuickListSelectionsCard = ({ projectId, initialSelections }: Props) => {
  const selectionsQuery = useListActiveSelections(projectId, {
    initialData: initialSelections,
  });
  const markShoppingDoneMutation = useMarkShoppingDone();
  const markAsCookedMutation = useMarkAsCooked();
  const removeSelectionMutation = useRemoveSelection();
  const selections = selectionsQuery.data ?? [];

  const pendingSelections = selections.filter((s) => s.status === "pending");
  const shoppingDoneSelections = selections.filter(
    (s) => s.status === "shopping_done"
  );

  const isMutatingSelection = (selectionId: string) =>
    (markShoppingDoneMutation.isPending &&
      markShoppingDoneMutation.variables?.selectionId === selectionId) ||
    (markAsCookedMutation.isPending &&
      markAsCookedMutation.variables?.selectionId === selectionId) ||
    (removeSelectionMutation.isPending &&
      removeSelectionMutation.variables?.selectionId === selectionId);

  const totalCount = selections.length;

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Nos repas</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {totalCount === 0
              ? "Aucun repas cette semaine"
              : `${totalCount} repas${totalCount > 1 ? "" : ""}`}
          </h2>
        </div>
      }
    >
      {totalCount === 0 ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <p className={styles["recipes-scaffold__helper"]}>
            Sélectionnez des recettes depuis le catalogue pour démarrer la
            semaine.
          </p>
          <Link href={buildRecipesCatalogRoute(projectId)}>
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className={styles["recipes-scaffold__sections"]}>
          {pendingSelections.length > 0 && (
            <section className={styles["recipes-scaffold__section"]}>
              <div className={styles["recipes-scaffold__section-head"]}>
                <p className={styles["recipes-scaffold__panel-kicker"]}>
                  À cuisiner
                </p>
                <Badge
                  label={`${pendingSelections.length}`}
                  variant="default"
                  size="small"
                />
              </div>
              <div className={styles["recipes-scaffold__summary-list"]}>
                {pendingSelections.map((selection) => (
                  <SelectionCard
                    key={selection.id}
                    projectId={projectId}
                    selection={selection}
                    isMutating={isMutatingSelection(selection.id)}
                    primaryAction={
                      <Button
                        label="Courses faites"
                        variant="secondary"
                        disabled={isMutatingSelection(selection.id)}
                        onClick={() => {
                          void markShoppingDoneMutation.mutate({
                            projectId,
                            selectionId: selection.id,
                          });
                        }}
                      />
                    }
                    onRemove={() => {
                      void removeSelectionMutation.mutate({
                        projectId,
                        selectionId: selection.id,
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {shoppingDoneSelections.length > 0 && (
            <section className={styles["recipes-scaffold__section"]}>
              <div className={styles["recipes-scaffold__section-head"]}>
                <p className={styles["recipes-scaffold__panel-kicker"]}>
                  Prêt à cuisiner
                </p>
                <Badge
                  label={`${shoppingDoneSelections.length}`}
                  variant="info"
                  size="small"
                />
              </div>
              <div className={styles["recipes-scaffold__summary-list"]}>
                {shoppingDoneSelections.map((selection) => (
                  <SelectionCard
                    key={selection.id}
                    projectId={projectId}
                    selection={selection}
                    isMutating={isMutatingSelection(selection.id)}
                    primaryAction={
                      <Button
                        label="Cuisiné ✓"
                        variant="secondary"
                        disabled={isMutatingSelection(selection.id)}
                        onClick={() => {
                          void markAsCookedMutation.mutate({
                            projectId,
                            selectionId: selection.id,
                          });
                        }}
                      />
                    }
                    onRemove={() => {
                      void removeSelectionMutation.mutate({
                        projectId,
                        selectionId: selection.id,
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {(markShoppingDoneMutation.isError ||
        markAsCookedMutation.isError ||
        removeSelectionMutation.isError) && (
        <p className={styles["recipes-scaffold__error"]}>
          La mise à jour n&apos;a pas pu être enregistrée. Réessayez.
        </p>
      )}
    </Card>
  );
};

export default QuickListSelectionsCard;
