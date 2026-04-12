import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

type Props = {
  search: string;
  selectedFilterLabels: string[];
};

const RecipesCatalogActiveFilters = ({
  search,
  selectedFilterLabels,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");
  const hasActiveFilters = search.length > 0 || selectedFilterLabels.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className={styles["recipes-page__active-filters"]}>
      {search ? (
        <span className={styles["recipes-page__tag"]}>
          {t("activeFilters.search", { search })}
        </span>
      ) : null}

      {selectedFilterLabels.map((filterLabel) => (
        <span key={filterLabel} className={styles["recipes-page__tag"]}>
          {filterLabel}
        </span>
      ))}
    </div>
  );
};

export default RecipesCatalogActiveFilters;
