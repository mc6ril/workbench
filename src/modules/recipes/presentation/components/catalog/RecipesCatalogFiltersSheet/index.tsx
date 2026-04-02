import styles from "./styles.module.scss";

import type { CatalogRecipeTag } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

type Props = {
  isOpen: boolean;
  search: string;
  tags: CatalogRecipeTag[];
  selectedTagSlugs: string[];
  hasActiveFilters: boolean;
  onClose: () => void;
  onToggleTag: (tagSlug: string) => void;
  onClearFilters: () => void;
};

const cx = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const RecipesCatalogFiltersSheet = ({
  isOpen,
  search,
  tags,
  selectedTagSlugs,
  hasActiveFilters,
  onClose,
  onToggleTag,
  onClearFilters,
}: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles["recipes-page__sheet-backdrop"]}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={styles["recipes-page__sheet"]}
        aria-label="Filtres du catalogue recipes"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles["recipes-page__sheet-header"]}>
          <div>
            <p className={styles["recipes-page__panel-kicker"]}>Filtres</p>
            <h2 className={styles["recipes-page__panel-title"]}>
              Affiner le catalogue
            </h2>
          </div>
          <button
            type="button"
            className={styles["recipes-page__sheet-close"]}
            onClick={onClose}
            aria-label="Fermer les filtres"
          >
            Fermer
          </button>
        </div>

        <div className={styles["recipes-page__sheet-body"]}>
          <p className={styles["recipes-page__sheet-copy"]}>
            La recherche texte reste dans la top bar. Ici, on pilote surtout les
            tags pour resserrer le catalogue rapidement.
          </p>

          {search ? (
            <div className={styles["recipes-page__sheet-search"]}>
              <span className={styles["recipes-page__sheet-search-label"]}>
                Recherche active
              </span>
              <strong>{search}</strong>
            </div>
          ) : null}

          <div className={styles["recipes-page__sheet-section"]}>
            <p className={styles["recipes-page__sheet-section-title"]}>Tags</p>
            <div className={styles["recipes-page__sheet-tag-grid"]}>
              {tags.map((tag) => {
                const isActive = selectedTagSlugs.includes(tag.slug);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={cx(
                      styles["recipes-page__filter-pill"],
                      isActive && styles["recipes-page__filter-pill--active"]
                    )}
                    aria-pressed={isActive}
                    onClick={() => {
                      onToggleTag(tag.slug);
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles["recipes-page__sheet-footer"]}>
          {hasActiveFilters ? (
            <button
              type="button"
              className={cx(
                styles["recipes-page__filter-pill"],
                styles["recipes-page__filter-pill--ghost"]
              )}
              onClick={onClearFilters}
            >
              Réinitialiser
            </button>
          ) : null}
          <button
            type="button"
            className={styles["recipes-page__secondary-link"]}
            onClick={onClose}
          >
            Appliquer
          </button>
        </div>
      </aside>
    </div>
  );
};

export default RecipesCatalogFiltersSheet;
