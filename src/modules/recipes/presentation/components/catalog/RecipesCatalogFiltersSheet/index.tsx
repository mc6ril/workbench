import Button from "@/shared/design-system/button";
import Checkbox from "@/shared/design-system/checkbox";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { RecipesCatalogFilterGroup } from "@/modules/recipes/presentation/components/catalog/recipesCatalogFilterGroups";

type Props = {
  isOpen: boolean;
  filterGroups: RecipesCatalogFilterGroup[];
  selectedFilterOptionIds: string[];
  appliedFilterOptionIds: string[];
  onClose: () => void;
  onToggleFilterOption: (filterOptionId: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
};

const cx = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const areTagSlugsEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const RecipesCatalogFiltersSheet = ({
  isOpen,
  filterGroups,
  selectedFilterOptionIds,
  appliedFilterOptionIds,
  onClose,
  onToggleFilterOption,
  onApplyFilters,
  onResetFilters,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");

  if (!isOpen) {
    return null;
  }

  const hasPendingChanges = !areTagSlugsEqual(
    selectedFilterOptionIds,
    appliedFilterOptionIds
  );

  return (
    <div
      className={styles["recipes-page__sheet-backdrop"]}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={styles["recipes-page__sheet"]}
        aria-label={t("sheet.ariaLabel")}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles["recipes-page__sheet-header"]}>
          <div className={styles["recipes-page__sheet-heading"]}>
            <Text
              as="span"
              variant="caption"
              className={styles["recipes-page__panel-kicker"]}
            >
              {t("sheet.kicker")}
            </Text>
            <Title variant="h2" className={styles["recipes-page__panel-title"]}>
              {t("sheet.title")}
            </Title>
          </div>

          <Button
            label={t("sheet.close")}
            variant="ghost"
            onClick={onClose}
            className={styles["recipes-page__sheet-close"]}
            aria-label={t("sheet.closeAriaLabel")}
          />
        </div>

        <div className={styles["recipes-page__sheet-body"]}>
          <div className={styles["recipes-page__sheet-groups"]}>
            {filterGroups.map((group) => (
              <section
                key={group.key}
                className={styles["recipes-page__sheet-section"]}
              >
                <Title
                  variant="h4"
                  className={styles["recipes-page__sheet-section-title"]}
                >
                  {group.title}
                </Title>

                <div className={styles["recipes-page__sheet-options"]}>
                  {group.options.map((option) => {
                    const isActive = selectedFilterOptionIds.includes(option.id);

                    return (
                      <div
                        key={option.id}
                        className={cx(
                          styles["recipes-page__sheet-option-card"],
                          isActive &&
                            styles["recipes-page__sheet-option-card--active"]
                        )}
                      >
                        <Checkbox
                          id={`recipes-filter-${option.id}`}
                          label={option.label}
                          checked={isActive}
                          onChange={() => {
                            onToggleFilterOption(option.id);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className={styles["recipes-page__sheet-footer"]}>
          <Button
            label={t("sheet.reset")}
            variant="secondary"
            onClick={onResetFilters}
            disabled={selectedFilterOptionIds.length === 0}
            className={styles["recipes-page__sheet-footer-button"]}
          />
          <Button
            label={
              hasPendingChanges ? t("sheet.applyPending") : t("sheet.apply")
            }
            onClick={onApplyFilters}
            className={styles["recipes-page__sheet-footer-button"]}
          />
        </div>
      </aside>
    </div>
  );
};

export default RecipesCatalogFiltersSheet;
