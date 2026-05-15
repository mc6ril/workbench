import { useTranslations } from "next-intl";

import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type { CookingHistoryEntry } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { buildRecipeDetailRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  entries: CookingHistoryEntry[];
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const RecipesCookingHistory = ({ projectId, entries }: Props) => {
  const t = useTranslations("pages.recipes.catalog.cookingHistory");

  if (entries.length === 0) return null;

  return (
    <section className={styles["cooking-history"]}>
      <p className={styles["cooking-history__kicker"]}>{t("kicker")}</p>
      <div className={styles["cooking-history__scroll"]}>
        {entries.map((entry) => (
          <Link
            key={entry.recipeId}
            href={buildRecipeDetailRoute(projectId, entry.recipeId)}
            prefetch={false}
            unstyled
            ariaLabel={t("openRecipeAriaLabel", { title: entry.title })}
            className={styles["cooking-history__card"]}
          >
            <div
              className={cx(
                styles["cooking-history__card-media"],
                styles[`cooking-history__card-media--${entry.coverStyle}`]
              )}
            />
            <span className={styles["cooking-history__card-title"]}>
              {entry.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecipesCookingHistory;
