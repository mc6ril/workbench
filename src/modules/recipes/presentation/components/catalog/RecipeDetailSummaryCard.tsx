import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  title: string;
  editHref: string;
  shoppingHref: string;
};

const RecipeDetailSummaryCard = ({ title, editHref, shoppingHref }: Props) => {
  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Fiche recette
          </p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>{title}</h2>
        </div>
      }
      footer={
        <div className={styles["recipes-scaffold__actions"]}>
          <Link href={editHref}>Ouvrir l&apos;edition</Link>
          <Link href={shoppingHref}>Voir les courses</Link>
        </div>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        La route detail garde l&apos;intention preview: lecture calme,
        ingredients tres visibles, puis etapes faciles a reprendre.
      </p>
      <div className={styles["recipes-scaffold__field-grid"]}>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Ingredients</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            Poulet, riz basmati, citron, yaourt grec, coriandre, sumac en test.
          </p>
        </div>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Etapes</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            Rincer, saisir, couvrir, melanger la sauce, servir.
          </p>
        </div>
      </div>
      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 2: minuterie, done, ajouts temporaires persistants et
        navigation entre recettes.
      </p>
    </Card>
  );
};

export default RecipeDetailSummaryCard;
