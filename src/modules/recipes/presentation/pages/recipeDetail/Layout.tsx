import type { ReactNode } from "react";
import Image from "next/image";

import Title from "@/shared/design-system/title";

import styles from "./styles.module.scss";

import type { CatalogRecipeCoverStyle } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import RecipeDetailMetaSummary from "@/modules/recipes/presentation/components/catalog/RecipeDetailView/RecipeDetailMetaSummary";

type Props = {
  title: string;
  coverImageUrl: string | null;
  coverStyle: CatalogRecipeCoverStyle;
  servingsLabel: string | null;
  totalTimeLabel: string | null;
  children: ReactNode;
};

const Layout = ({
  title,
  coverImageUrl,
  coverStyle,
  servingsLabel,
  totalTimeLabel,
  children,
}: Props) => {
  const heroClass = [
    styles["recipe-detail-page__hero"],
    styles[`recipe-detail-page__hero--${coverStyle}`],
  ].join(" ");

  return (
    <div className={styles["recipe-detail-page"]}>
      <header className={heroClass}>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) calc(100vw - 18rem), 100vw"
            className={styles["recipe-detail-page__hero-image"]}
          />
        ) : null}
        <div
          className={styles["recipe-detail-page__hero-overlay"]}
          aria-hidden
        />
        <div className={styles["recipe-detail-page__hero-content"]}>
          <Title variant="h1" className={styles["recipe-detail-page__title"]}>
            {title}
          </Title>
          <RecipeDetailMetaSummary
            servingsLabel={servingsLabel}
            totalTimeLabel={totalTimeLabel}
            hero
          />
        </div>
      </header>
      {children}
    </div>
  );
};

export default Layout;
