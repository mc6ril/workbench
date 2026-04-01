import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  href: string;
  variant?: "empty" | "active";
};

const ACTIVE_ITEMS = [
  {
    title: "Poulet citron & riz pilaf",
    note: "Mardi soir, version sauce yaourt citronnee.",
  },
  {
    title: "Rigatoni tomates roties & burrata",
    note: "Jeudi, simple a relancer apres une grosse journee.",
  },
  {
    title: "Bol croustillant tofu miel-sesame",
    note: "Samedi midi avec les legumes du marche.",
  },
];

const QuickListSummaryCard = ({ href, variant = "active" }: Props) => {
  const isEmpty = variant === "empty";

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Quick list</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {isEmpty
              ? "Visible meme a vide"
              : "Route prete pour la planification"}
          </h2>
        </div>
      }
      footer={<Link href={href}>Ouvrir la quick list</Link>}
    >
      {isEmpty ? (
        <>
          <p className={styles["recipes-scaffold__panel-copy"]}>
            La place de la quick list est fixee dans le module, meme quand rien
            n&apos;est encore selectionne.
          </p>
          <p className={styles["recipes-scaffold__note"]}>
            Aucune recette retenue pour l&apos;instant. Les prochaines etapes
            brancheront la vraie selection depuis le catalogue.
          </p>
        </>
      ) : (
        <>
          <p className={styles["recipes-scaffold__panel-copy"]}>
            La route existe deja pour accueillir la vraie logique planner sans
            bouger le parcours utilisateur.
          </p>
          <ul className={styles["recipes-scaffold__list"]}>
            {ACTIVE_ITEMS.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <br />
                {item.note}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
};

export default QuickListSummaryCard;
