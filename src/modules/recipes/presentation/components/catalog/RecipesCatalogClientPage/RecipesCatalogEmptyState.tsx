import { BUTTON_LABELS } from "@/shared/a11y";
import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

type Props = {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

const RecipesCatalogEmptyState = ({
  hasActiveFilters,
  onClearFilters,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");

  return (
    <div className={styles["recipes-page__empty-state"]}>
      <Text
        as="span"
        variant="caption"
        className={styles["recipes-page__panel-kicker"]}
      >
        {t("empty.kicker")}
      </Text>
      <Title variant="h2" className={styles["recipes-page__empty-state-title"]}>
        {t("empty.title")}
      </Title>
      <Text
        variant="small"
        className={styles["recipes-page__empty-state-copy"]}
      >
        {t("empty.description")}
      </Text>

      {hasActiveFilters ? (
        <Button
          label={BUTTON_LABELS.RESET}
          type="button"
          variant="secondary"
          className={styles["recipes-page__empty-state-action"]}
          onClick={onClearFilters}
        />
      ) : null}
    </div>
  );
};

export default RecipesCatalogEmptyState;
