import { PROJECT_VIEWS } from "@/shared/constants/routes";
import Badge from "@/shared/design-system/badge";
import Title from "@/shared/design-system/title";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./styles.module.scss";

type Props = {
  projectId: string;
};

const FOUNDATION_PANELS = [
  {
    title: "Catalogue chaleureux",
    description:
      "Une entrée douce pour parcourir les recettes, filtrer vite et garder les bons plats sous la main.",
  },
  {
    title: "Quick list visible",
    description:
      "Le futur parcours garde toujours une liste courte de repas retenus, sans alourdir la navigation.",
  },
  {
    title: "Sortie courses nette",
    description:
      "La liste de courses restera très lisible, pensée pour passer du projet au quotidien sans friction.",
  },
];

const NEXT_STEPS = [
  "Poser le catalogue et sa quick list dans la vraie navigation projet.",
  "Brancher le détail recette et la shopping list sur une logique produit réelle.",
  "Faire évoluer l’éditeur sans casser la séparation d’architecture cible.",
];

const RecipesPage = ({ projectId }: Props) => {
  return (
    <div className={styles["recipes-page"]}>
      <section className={styles["recipes-page__hero"]}>
        <div className={styles["recipes-page__hero-copy"]}>
          <Badge label="Recipes active" variant="success" />
          <Title variant="h1" className={styles["recipes-page__title"]}>
            Recipes entre dans le projet avec une base propre et prête pour la
            suite.
          </Title>
          <p className={styles["recipes-page__description"]}>
            Cette première étape active le module, aligne la navigation sur la
            preview validée et prépare l’arrivée progressive de la vraie logique
            produit.
          </p>
        </div>

        <div className={styles["recipes-page__hero-preview"]} aria-hidden="true">
          <div className={styles["recipes-page__preview-main"]}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles["recipes-page__preview-side"]}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className={styles["recipes-page__grid"]}>
        {FOUNDATION_PANELS.map((panel) => (
          <article key={panel.title} className={styles["recipes-page__panel"]}>
            <p className={styles["recipes-page__panel-kicker"]}>Preview intent</p>
            <h2 className={styles["recipes-page__panel-title"]}>{panel.title}</h2>
            <p className={styles["recipes-page__panel-copy"]}>
              {panel.description}
            </p>
          </article>
        ))}
      </section>

      <section className={styles["recipes-page__roadmap"]}>
        <div>
          <p className={styles["recipes-page__panel-kicker"]}>Étape 1 livrée</p>
          <h2 className={styles["recipes-page__roadmap-title"]}>
            Le module est visible, activable et déjà cohérent avec le shell
            projet.
          </h2>
        </div>

        <ul className={styles["recipes-page__roadmap-list"]}>
          {NEXT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>

        <div className={styles["recipes-page__links"]}>
          <a href={buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}>
            Revenir au tableau
          </a>
          <a href={buildProjectRoute(projectId, PROJECT_VIEWS.SETTINGS)}>
            Ouvrir les paramètres du projet
          </a>
        </div>
      </section>
    </div>
  );
};

export default RecipesPage;
