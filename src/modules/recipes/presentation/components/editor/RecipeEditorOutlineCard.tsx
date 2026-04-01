import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  href: string;
  mode: "create" | "edit";
};

const RecipeEditorOutlineCard = ({ href, mode }: Props) => {
  const isCreate = mode === "create";

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            {isCreate ? "Creation" : "Edition"}
          </p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {isCreate
              ? "Entree simple pour une nouvelle recette"
              : "Meme confort de lecture, en mode edition"}
          </h2>
        </div>
      }
      footer={
        <Link href={href}>
          {isCreate ? "Ouvrir la creation" : "Ouvrir l'edition"}
        </Link>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        {isCreate
          ? "La route est prete pour accueillir un vrai draft editor sans replier l'architecture."
          : "La separation editor est posee avant d'ajouter la sauvegarde et les validations metier."}
      </p>
      <div className={styles["recipes-scaffold__field-grid"]}>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Titre</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            {isCreate ? "Nouvelle recette" : "Poulet citron & riz pilaf"}
          </p>
        </div>
        <div className={styles["recipes-scaffold__field"]}>
          <p className={styles["recipes-scaffold__field-label"]}>Portions</p>
          <p className={styles["recipes-scaffold__field-value"]}>
            {isCreate ? "A definir" : "2 portions"}
          </p>
        </div>
      </div>
      <div className={styles["recipes-scaffold__pill-row"]}>
        <span className={styles["recipes-scaffold__pill"]}>Rapide</span>
        <span className={styles["recipes-scaffold__pill"]}>Batch</span>
        <span
          className={[
            styles["recipes-scaffold__pill"],
            styles["recipes-scaffold__pill--active"],
          ].join(" ")}
        >
          {isCreate ? "Ajout en attente" : "Ajout a tester"}
        </span>
      </div>
    </Card>
  );
};

export default RecipeEditorOutlineCard;
