"use client";

import { useTranslations } from "next-intl";

import Badge from "@/shared/design-system/badge";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import ErrorMessage from "@/shared/design-system/error_message";
import Link from "@/shared/design-system/link";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";

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
  viewLabel: string;
  removeLabel: string;
  onRemove: () => void;
};

const SelectionCard = ({
  projectId,
  selection,
  isMutating,
  primaryAction,
  viewLabel,
  removeLabel,
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
      <Text
        variant="small"
        className={styles["recipes-scaffold__summary-meta"]}
      >
        {selection.servingsLabel}
      </Text>
    </div>
    <div className={styles["recipes-scaffold__selection-side"]}>
      <div className={styles["recipes-scaffold__actions"]}>
        <Link
          href={buildRecipeDetailRoute(projectId, selection.recipeId)}
          prefetch={false}
        >
          {viewLabel}
        </Link>
        {primaryAction}
        <Button
          label={removeLabel}
          variant="danger"
          disabled={isMutating}
          onClick={onRemove}
        />
      </div>
    </div>
  </article>
);

const QuickListSelectionsCard = ({ projectId, initialSelections }: Props) => {
  const t = useTranslations("pages.recipes.quickList");
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
          <Text
            as="span"
            variant="caption"
            className={styles["recipes-scaffold__panel-kicker"]}
          >
            {t("kicker")}
          </Text>
          <Title variant="h3">
            {totalCount === 0
              ? t("titleEmpty")
              : t("titleFilled", { count: totalCount })}
          </Title>
        </div>
      }
    >
      {totalCount === 0 ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <Text variant="small">{t("emptyDescription")}</Text>
          <Link href={buildRecipesCatalogRoute(projectId)}>
            {t("browseCatalog")}
          </Link>
        </div>
      ) : (
        <div className={styles["recipes-scaffold__sections"]}>
          {pendingSelections.length > 0 && (
            <section className={styles["recipes-scaffold__section"]}>
              <div className={styles["recipes-scaffold__section-head"]}>
                <Text
                  as="span"
                  variant="caption"
                  className={styles["recipes-scaffold__panel-kicker"]}
                >
                  {t("pendingSection")}
                </Text>
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
                    viewLabel={t("viewRecipe")}
                    removeLabel={t("remove")}
                    primaryAction={
                      <Button
                        label={t("markShoppingDone")}
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
                <Text
                  as="span"
                  variant="caption"
                  className={styles["recipes-scaffold__panel-kicker"]}
                >
                  {t("shoppingDoneSection")}
                </Text>
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
                    viewLabel={t("viewRecipe")}
                    removeLabel={t("remove")}
                    primaryAction={
                      <Button
                        label={t("markAsCooked")}
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
        <ErrorMessage message={t("updateFailed")} />
      )}
    </Card>
  );
};

export default QuickListSelectionsCard;
