import Text from "@/shared/design-system/text";

import styles from "./styles.module.scss";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

type Props = {
  tags: CatalogRecipeDetail["tags"];
};

const RecipeDetailTagList = ({ tags }: Props) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={styles["recipe-detail__tag-row"]}>
      {tags.map((tag) => (
        <Text
          key={tag.id}
          as="span"
          variant="small"
          className={styles["recipe-detail__tag"]}
        >
          {tag.label}
        </Text>
      ))}
    </div>
  );
};

export default RecipeDetailTagList;
