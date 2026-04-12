import Loader from "@/shared/design-system/loader";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

type Props = {
  loadMoreSentinelRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
};

const RecipesCatalogPagination = ({
  loadMoreSentinelRef,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");

  return (
    <div className={styles["recipes-page__pagination"]}>
      <div
        ref={loadMoreSentinelRef}
        className={styles["recipes-page__sentinel"]}
        aria-hidden="true"
      />

      <button
        type="button"
        className={styles["recipes-page__load-more-button"]}
        onClick={onFetchNextPage}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? t("pagination.loading")
          : t("pagination.loadMore")}
      </button>

      {isFetchingNextPage ? (
        <div className={styles["recipes-page__load-more-status"]}>
          <Loader
            variant="inline"
            size="small"
            message={t("pagination.loadingMessage")}
            ariaLabel={t("pagination.loadingAriaLabel")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default RecipesCatalogPagination;
