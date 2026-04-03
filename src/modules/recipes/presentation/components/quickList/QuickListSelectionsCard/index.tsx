"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Badge from "@/shared/design-system/badge";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type {
  DoneQuickListSelection,
  QuickListRecipe,
} from "@/modules/recipes/core/domain/planner/quickList.types";
import { useListActiveSelections } from "@/modules/recipes/presentation/hooks/planner/listActiveSelections";
import { useMarkSelectionDone } from "@/modules/recipes/presentation/hooks/planner/useMarkSelectionDone";
import { useRemoveSelection } from "@/modules/recipes/presentation/hooks/planner/useRemoveSelection";
import {
  buildRecipeDetailRoute,
  buildRecipesCatalogRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  initialSelections: QuickListRecipe[];
};

const QuickListSelectionsCard = ({ projectId, initialSelections }: Props) => {
  const router = useRouter();
  const [doneSelection, setDoneSelection] =
    useState<DoneQuickListSelection | null>(null);
  const selectionsQuery = useListActiveSelections(projectId, {
    initialData: initialSelections,
  });
  const markSelectionDoneMutation = useMarkSelectionDone();
  const removeSelectionMutation = useRemoveSelection();
  const selections = selectionsQuery.data ?? [];

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Quick list</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {selections.length === 0
              ? "Semaine encore ouverte"
              : `${selections.length} repas actif${selections.length > 1 ? "s" : ""}`}
          </h2>
        </div>
      }
    >
      {doneSelection ? (
        <div className={styles["recipes-scaffold__success-banner"]}>
          <div className={styles["recipes-scaffold__stack"]}>
            <p className={styles["recipes-scaffold__panel-kicker"]}>Done</p>
            <h3 className={styles["recipes-scaffold__section-title"]}>
              {doneSelection.title} a quitté la quick list
            </h3>
            <p className={styles["recipes-scaffold__helper"]}>
              La semaine continue avec {selections.length} repas restant
              {selections.length > 1 ? "s" : ""}.
            </p>
          </div>
          <Badge label="Done" variant="success" />
        </div>
      ) : null}

      <p className={styles["recipes-scaffold__panel-copy"]}>
        La quick list garde les repas prévus sous la main, avec un accès direct
        à la fiche et deux décisions simples: done ou retirer la sélection.
      </p>

      {selections.length === 0 ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <p className={styles["recipes-scaffold__helper"]}>
            Aucune recette active pour le moment.
          </p>
          <Link href={buildRecipesCatalogRoute(projectId)}>
            Retour au catalogue
          </Link>
        </div>
      ) : (
        <div className={styles["recipes-scaffold__summary-list"]}>
          {selections.map((selection) => {
            const isMutatingCurrentSelection =
              (markSelectionDoneMutation.isPending &&
                markSelectionDoneMutation.variables?.selectionId ===
                  selection.id) ||
              (removeSelectionMutation.isPending &&
                removeSelectionMutation.variables?.selectionId === selection.id);

            return (
              <article
                key={selection.id}
                className={styles["recipes-scaffold__selection-card"]}
              >
                <div className={styles["recipes-scaffold__summary-copy"]}>
                  <div className={styles["recipes-scaffold__summary-head"]}>
                    <Link
                      href={buildRecipeDetailRoute(projectId, selection.recipeId)}
                    >
                      {selection.title}
                    </Link>
                    <Badge label="Active" variant="success" size="small" />
                  </div>
                  <p className={styles["recipes-scaffold__helper"]}>
                    {selection.note ?? "Recette retenue pour un prochain repas."}
                  </p>
                </div>

                <div className={styles["recipes-scaffold__selection-side"]}>
                  <span className={styles["recipes-scaffold__summary-meta"]}>
                    {selection.servingsLabel}
                  </span>
                  <div className={styles["recipes-scaffold__actions"]}>
                    <Link
                      href={buildRecipeDetailRoute(projectId, selection.recipeId)}
                    >
                      Voir la fiche
                    </Link>
                    <Button
                      label="Done"
                      variant="secondary"
                      disabled={isMutatingCurrentSelection}
                      onClick={async () => {
                        const result =
                          await markSelectionDoneMutation.mutateAsync({
                            projectId,
                            selectionId: selection.id,
                          });

                        setDoneSelection(result);
                        router.refresh();
                      }}
                    />
                    <Button
                      label="Retirer"
                      variant="danger"
                      disabled={isMutatingCurrentSelection}
                      onClick={async () => {
                        await removeSelectionMutation.mutateAsync({
                          projectId,
                          selectionId: selection.id,
                        });

                        router.refresh();
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {markSelectionDoneMutation.isError || removeSelectionMutation.isError ? (
        <p className={styles["recipes-scaffold__error"]}>
          La quick list n&apos;a pas pu être mise à jour. Réessayez.
        </p>
      ) : null}
    </Card>
  );
};

export default QuickListSelectionsCard;
