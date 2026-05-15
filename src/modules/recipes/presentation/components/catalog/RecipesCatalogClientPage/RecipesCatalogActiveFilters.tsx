import Text from "@/shared/design-system/text";
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
        <Text as="span" className={styles["recipes-page__tag"]}>
          {t("activeFilters.search", { search })}
        </Text>
      ) : null}

      {selectedFilterLabels.map((filterLabel) => (
        <Text
          as="span"
          key={filterLabel}
          className={styles["recipes-page__tag"]}
        >
          {filterLabel}
        </Text>
      ))}
    </div>
  );
};

export default RecipesCatalogActiveFilters;
