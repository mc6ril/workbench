import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

type Props = {
  recipesCount: number;
  hasActiveFilters: boolean;
  isRefreshing: boolean;
};

const RecipesCatalogHeader = ({
  recipesCount,
  hasActiveFilters,
  isRefreshing,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");

  return (
    <div className={styles["recipes-page__catalog-head"]}>
      <div>
        <Text
          as="span"
          variant="caption"
          className={styles["recipes-page__panel-kicker"]}
        >
          {t("header.kicker")}
        </Text>
        <Title variant="h1" className={styles["recipes-page__catalog-title"]}>
          {hasActiveFilters ? t("header.filteredTitle") : t("header.title")}
        </Title>
      </div>

      <div className={styles["recipes-page__catalog-summary"]}>
        <span>
          {hasActiveFilters
            ? t("summary.filteredResults", { count: recipesCount })
            : t("summary.availableResults", { count: recipesCount })}
        </span>
        {isRefreshing ? (
          <span className={styles["recipes-page__catalog-status"]}>
            {t("summary.refreshing")}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default RecipesCatalogHeader;
