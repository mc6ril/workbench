import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import CatalogPreviewPanel from "@/modules/recipes/presentation/components/catalog/CatalogPreviewPanel";
import RecipeEditorOutlineCard from "@/modules/recipes/presentation/components/editor/RecipeEditorOutlineCard";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import ShoppingSummaryCard from "@/modules/recipes/presentation/components/shopping/ShoppingSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipeCreationRoute,
  buildRecipeDetailRoute,
  buildRecipeEditRoute,
  buildRecipesQuickListRoute,
  buildRecipesShoppingRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
};

const SAMPLE_RECIPE_ID = "poulet-citron-riz-pilaf";

const ROUTE_BLUEPRINT = [
  {
    title: "Catalogue",
    description:
      "Route principale pour le parcours de decouverte et d'ajout a la quick list.",
    cta: "Voir la route catalogue",
  },
  {
    title: "Quick list",
    description:
      "Espace dedie au planner hebdo, distinct du catalogue des aujourd'hui.",
    cta: "Voir la quick list",
  },
  {
    title: "Shopping list",
    description:
      "Surface reservee a la sortie courses, deja separee de la lecture recette.",
    cta: "Voir les courses",
  },
];

const RecipesPage = ({ projectId }: Props) => {
  const quickListHref = buildRecipesQuickListRoute(projectId);
  const shoppingHref = buildRecipesShoppingRoute(projectId);
  const createHref = buildRecipeCreationRoute(projectId);
  const detailHref = buildRecipeDetailRoute(projectId, SAMPLE_RECIPE_ID);
  const editHref = buildRecipeEditRoute(projectId, SAMPLE_RECIPE_ID);

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / catalogue"
      title="Le module Recipes a maintenant sa vraie ossature."
      description="La page d'entree reprend la hierarchie validee dans la preview: catalogue en premier, quick list toujours visible, puis sorties detail, shopping et edition deja prevues sans embarquer encore le metier."
      actions={[
        { href: quickListHref, label: "Ouvrir la quick list" },
        { href: shoppingHref, label: "Ouvrir la shopping list" },
        { href: createHref, label: "Ouvrir la creation" },
      ]}
      aside={
        <div className={styles["recipes-scaffold__metric-grid"]}>
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>6</span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              routes recipes deja posees dans le shell projet.
            </span>
          </div>
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>4</span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              sous-domaines separes: catalog, planner, shopping, editor.
            </span>
          </div>
        </div>
      }
    >
      <section className={styles["recipes-scaffold__section"]}>
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Navigation preview
          </p>
          <h2 className={styles["recipes-scaffold__section-title"]}>
            Le shell reprend l&apos;intention validee sans remaquetter le
            module.
          </h2>
        </div>

        <div className={styles["recipes-scaffold__shell"]}>
          <div className={styles["recipes-scaffold__shell-sidebar"]}>
            <span className={styles["recipes-scaffold__shell-title"]}>
              Projet courant
            </span>
            <span className={styles["recipes-scaffold__shell-item"]}>
              Board
            </span>
            <span
              className={[
                styles["recipes-scaffold__shell-item"],
                styles["recipes-scaffold__shell-item--active"],
              ].join(" ")}
            >
              Recipes
            </span>
            <span className={styles["recipes-scaffold__shell-item"]}>
              Settings
            </span>
          </div>
          <div className={styles["recipes-scaffold__shell-main"]}>
            <span className={styles["recipes-scaffold__shell-title"]}>
              Recette foundation
            </span>
            <p className={styles["recipes-scaffold__panel-copy"]}>
              La route principale pose tout de suite la bonne hierarchie:
              catalogue, quick list, shopping, detail et edition. La logique
              produit viendra ensuite, sans casser la navigation.
            </p>
            <div className={styles["recipes-scaffold__pill-row"]}>
              <span
                className={[
                  styles["recipes-scaffold__pill"],
                  styles["recipes-scaffold__pill--active"],
                ].join(" ")}
              >
                Catalogue en entree
              </span>
              <span className={styles["recipes-scaffold__pill"]}>
                Quick list visible
              </span>
              <span className={styles["recipes-scaffold__pill"]}>
                Shopping separe
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles["recipes-scaffold__grid"]}>
        <CatalogPreviewPanel
          href={detailHref}
          title="Base catalogue prete pour la suite"
          description="On remplace le placeholder etape 1 par une page qui ressemble deja a la future entree produit, tout en restant route-level."
          highlights={[
            "Route principale deja stable dans le shell projet.",
            "Sous-routes detail, quick list, shopping et editor deja raccordees.",
            "Microcopies principales preservees: catalogue, quick list, shopping.",
          ]}
          ctaLabel="Ouvrir un detail exemple"
        />

        <QuickListSummaryCard href={quickListHref} variant="empty" />
        <ShoppingSummaryCard href={shoppingHref} />
        <RecipeEditorOutlineCard href={createHref} mode="create" />
      </div>

      <section className={styles["recipes-scaffold__section"]}>
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Routes ready
          </p>
          <h2 className={styles["recipes-scaffold__section-title"]}>
            Chaque etat cle a maintenant son point d&apos;entree propre.
          </h2>
        </div>

        <div className={styles["recipes-scaffold__route-grid"]}>
          <article className={styles["recipes-scaffold__route-card"]}>
            <span className={styles["recipes-scaffold__route-title"]}>
              {ROUTE_BLUEPRINT[0].title}
            </span>
            <p className={styles["recipes-scaffold__route-copy"]}>
              {ROUTE_BLUEPRINT[0].description}
            </p>
            <Link
              href={detailHref}
              className={styles["recipes-scaffold__route-link"]}
            >
              {ROUTE_BLUEPRINT[0].cta}
            </Link>
          </article>

          <article className={styles["recipes-scaffold__route-card"]}>
            <span className={styles["recipes-scaffold__route-title"]}>
              {ROUTE_BLUEPRINT[1].title}
            </span>
            <p className={styles["recipes-scaffold__route-copy"]}>
              {ROUTE_BLUEPRINT[1].description}
            </p>
            <Link
              href={quickListHref}
              className={styles["recipes-scaffold__route-link"]}
            >
              {ROUTE_BLUEPRINT[1].cta}
            </Link>
          </article>

          <article className={styles["recipes-scaffold__route-card"]}>
            <span className={styles["recipes-scaffold__route-title"]}>
              {ROUTE_BLUEPRINT[2].title}
            </span>
            <p className={styles["recipes-scaffold__route-copy"]}>
              {ROUTE_BLUEPRINT[2].description}
            </p>
            <Link
              href={shoppingHref}
              className={styles["recipes-scaffold__route-link"]}
            >
              {ROUTE_BLUEPRINT[2].cta}
            </Link>
          </article>
        </div>
      </section>

      <Card variant="outlined">
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            Volontairement hors scope
          </p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            L&apos;etape 2 s&apos;arrete a l&apos;ossature.
          </h2>
        </div>
        <ul className={styles["recipes-scaffold__list"]}>
          <li>
            Aucune vraie persistance Recipes n&apos;est branchee cote produit.
          </li>
          <li>Le catalogue ne charge pas encore de vraies recettes.</li>
          <li>
            La quick list, la shopping list et l&apos;editor restent
            squelettiques.
          </li>
          <li>
            Le flow done et les comportements mobile restent reserves aux etapes
            suivantes.
          </li>
        </ul>
        <div className={styles["recipes-scaffold__actions"]}>
          <Link href={detailHref}>Voir le detail exemple</Link>
          <Link href={editHref}>Voir l&apos;edition exemple</Link>
        </div>
      </Card>
    </RecipesPageScaffold>
  );
};

export default RecipesPage;
