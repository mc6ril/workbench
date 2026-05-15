# PRD — Module Recipes

## Vue d'ensemble

Le module Recipes est un espace de planification des repas intégré à un projet. Il permet à plusieurs utilisateurs d'un même projet de constituer un catalogue de recettes, de sélectionner collectivement les repas de la semaine, de générer une liste de courses partagée, et — pour les recettes rendues publiques — d'interagir avec une communauté plus large via les likes et commentaires.

L'espace est conçu pour un usage quotidien par des utilisateurs sans compétences techniques. Aucun vocabulaire développeur ne doit apparaître dans l'interface.

---

## Utilisateurs cibles

- **Membres d'un foyer ou d'un groupe** qui planifient leurs repas collectivement.
- **Utilisateurs solo** qui gèrent leur propre catalogue et leurs semaines.
- La planification est collaborative : plusieurs membres peuvent agir sur la quick list et la liste de courses simultanément, depuis différents appareils.

---

## Périmètre de la feature

### 1. Catalogue de recettes

Le catalogue est la liste complète des recettes accessibles dans un projet.

**Visibilité des recettes**

Une recette a un statut de visibilité :

- **Privée** : visible et utilisable uniquement dans le projet où elle a été créée.
- **Publique** : visible par tous les projets de la plateforme. Elle peut être sélectionnée dans n'importe quel projet.

Une recette publique reste éditable uniquement par les membres du projet qui l'a créée (éditeurs et admins).

**Contenu d'une recette**

- Titre, résumé court, photo de couverture
- Temps de préparation, nombre de personnes
- Liste d'ingrédients structurés (quantité, unité, nom visible, note)
- Étapes de préparation
- Tags (type, équipement, régimes, popularité, tags personnalisés)
- **Date de dernière cuisson** (par projet — voir §3)

**Fonctionnalités du catalogue**

- Recherche full-text (titre, résumé, ingrédients)
- Filtres multi-critères via un panneau dédié
- Tri par mise à jour décroissante (défaut)
- Infinite scroll (cursor-based pagination)
- Panneau "Repas de la semaine" (quick list) superposé au catalogue pour ajouter/retirer rapidement des recettes
- Mise en avant des recettes récemment cuisinées dans le projet (éviter les répétitions)

**Cache**

Le catalogue est de la donnée stable. `staleTime` = 7 jours. Pas de refetch automatique sur focus. Un bouton "Actualiser" manuel est disponible. Le scroll vers le bas charge les pages suivantes mais ne refraishe pas les pages déjà chargées.

---

### 2. Repas de la semaine (Quick List)

L'espace où les membres du projet sélectionnent les repas à préparer dans la période à venir.

**Comportement**

- Un membre ajoute une recette depuis le catalogue → elle apparaît dans la quick list avec le statut `pending`.
- La quick list est **partagée et en temps réel** : toute modification (ajout, changement de statut, suppression) est immédiatement visible pour tous les membres connectés, sur tous les appareils, sans rechargement.

**États d'une sélection**

Une sélection passe par trois états séquentiels :

| État | Signification | Visible dans la quick list | Génère des courses |
|---|---|---|---|
| `pending` | Recette ajoutée, ingrédients pas encore achetés | ✓ | ✓ |
| `shopping_done` | Courses faites pour cette recette, repas pas encore cuisiné | ✓ | ✗ |
| supprimée | Recette cuisinée ou retirée manuellement | ✗ | ✗ |

**Actions disponibles sur une sélection**

- **"Courses faites"** : passe de `pending` à `shopping_done`. La recette reste visible dans la quick list (dans une section "Prêt à cuisiner") mais disparaît de la liste de courses.
- **"Cuisiné"** : supprime la sélection de la quick list. Déclenche la mise à jour de la date de dernière cuisson dans le projet (voir §5). La recette reste disponible dans le catalogue et peut être resélectionnée à tout moment.
- **"Retirer"** : supprime la sélection sans marquer la recette comme cuisinée. Aucun effet sur la date de cuisson.

**Affichage**

La quick list distingue visuellement deux sections :
- "À faire" : sélections `pending`
- "Prêt à cuisiner" : sélections `shopping_done`

**Realtime**

Abonnement Supabase Realtime sur `recipe_selections` filtré par `project_id`. Toute insertion, mise à jour ou suppression d'une sélection invalide le cache React Query de la quick list pour tous les membres connectés.

---

### 3. Liste de courses

Générée automatiquement à partir des sélections en statut `pending` uniquement. Les sélections `shopping_done` sont exclues.

**Règles de génération**

- Les ingrédients sont regroupés par catégorie (groupe d'aliments).
- Deux lignes d'ingrédients sont fusionnées uniquement si le nom normalisé, l'unité et la nature de la quantité sont compatibles.
- Les quantités libres (ex. "au goût", "quelques") restent des lignes autonomes et ne sont pas fusionnées.
- Les "ajouts à tester" (ingrédients candidats non encore validés dans une recette) restent identifiés séparément.

**Interactions**

- Chaque article est cochable (optimistic update immédiat).
- Cocher un article ne change pas le statut de la sélection — c'est un suivi de courses indépendant.
- Un article coché reste visible (barré) jusqu'à ce que les courses soient marquées comme terminées.

**Regénération**

La liste de courses est regénérée à la demande (bouton "Mettre à jour la liste") ou automatiquement quand les sélections `pending` changent. Elle n'est pas regénérée à chaque chargement de page si les sélections n'ont pas évolué (hash de contrôle sur les `recipe_selection.id[]`).

**Navigation**

La liste de courses est accessible depuis la quick list et depuis la toolbar principale.

---

### 4. Éditeur de recette

Formulaire de création et de modification d'une recette.

**Champs**

- Titre (requis)
- Résumé court
- Photo de couverture (upload vers le bucket `recipe-covers`)
- Temps de préparation, nombre de personnes
- Ingrédients : quantité structurée (nombre ou fraction), unité, nom visible, note — ou texte libre
- Étapes numérotées
- Tags (sélection depuis les tags existants + création de tags personnalisés)
- Visibilité (privée / publique)

**Brouillon local**

Un brouillon de création est sauvegardé en localStorage avec un debounce de 800 ms. Il est restauré si l'utilisateur quitte et revient sur la page de création.

**Permissions**

- Création : membres avec rôle éditeur ou admin.
- Modification : membres éditeurs/admins du projet qui a créé la recette.
- Les recettes publiques peuvent être lues par tous mais modifiées uniquement par le projet d'origine.

---

### 5. Historique de cuisson par projet

Quand une sélection est marquée "Cuisinée", on enregistre cette date dans un historique propre au projet.

**Modèle**

Table `recipe_cooking_history` :

```
project_id      uuid    (FK projects)
recipe_id       uuid    (FK recipes)
cooked_at       timestamptz
cooked_by       uuid    (FK users, nullable)
```

Pas de colonne `last_cooked_at` sur `recipes` directement — la date est par projet. Chaque projet a son propre historique de cuisson.

**Usage**

- La fiche recette dans le catalogue affiche "Cuisiné le [date]" si une entrée existe dans l'historique du projet courant.
- Les filtres du catalogue peuvent inclure un filtre "Pas cuisiné depuis X semaines" basé sur cet historique.
- Le tri peut prendre en compte la date de dernière cuisson pour éviter de pousser des recettes récentes.

---

### 6. Recettes publiques — Likes et commentaires

Lorsqu'une recette est rendue publique, elle devient visible dans le catalogue de tous les projets et bénéficie d'une couche sociale.

**Likes**

- Tout utilisateur authentifié peut liker une recette publique.
- Le nombre de likes est affiché sur la carte et dans la fiche recette.
- Un utilisateur peut liker/unliker. Son état (liké ou non) est visible dans l'interface.

Table `recipe_likes` :
```
id              uuid
recipe_id       uuid    (FK recipes)
user_id         uuid    (FK users)
created_at      timestamptz
UNIQUE (recipe_id, user_id)
```

**Commentaires**

- Tout utilisateur authentifié peut commenter une recette publique.
- Les commentaires sont affichés dans la fiche recette, ordre chronologique.
- L'auteur d'un commentaire peut le modifier ou le supprimer.
- Les admins du projet qui a créé la recette peuvent supprimer n'importe quel commentaire.

Table `recipe_comments` :
```
id              uuid
recipe_id       uuid    (FK recipes)
user_id         uuid    (FK users)
content         text    (max 2000 caractères)
created_at      timestamptz
updated_at      timestamptz
deleted_at      timestamptz  (soft delete)
```

**Affichage**

- Sur la carte catalogue : nombre de likes (si recette publique).
- Dans la fiche recette : section likes + section commentaires (avec pagination).
- Les commentaires sont chargés séparément (lazy) pour ne pas alourdir le chargement de la fiche.

---

## Stratégie de cache et realtime

| Donnée | staleTime | Refetch | Realtime | Invalidé par |
|---|---|---|---|---|
| Catalogue (liste) | 7 jours | Manuel ("Actualiser") | Non | `createRecipe`, `updateRecipe` |
| Tags du catalogue | 7 jours | Non | Non | `createRecipe`, `updateRecipe` |
| Quick list | 0 (toujours frais) | Realtime | **Oui** | Realtime `recipe_selections` |
| Liste de courses | 5 min | Sur changement de sélections `pending` | Non | Changement de sélections `pending` |
| Fiche recette | 1 jour | Non | Non | `updateRecipe` |
| Likes | 5 min | Non | Non | `likeRecipe`, `unlikeRecipe` |
| Commentaires | 2 min | Non | Non | `addComment`, `deleteComment` |
| Historique cuisson | 1 heure | Non | Non | `markAsCooked` |

**Realtime (quick list)**

Abonnement sur `recipe_selections` (INSERT, UPDATE, DELETE) filtré par `project_id`. Sur événement : `queryClient.invalidateQueries(recipesQueryKeys.planner.quickList(projectId))`. Pas d'invalidation de la liste de courses ni du catalogue.

---

## Invalidation ciblée par mutation

| Mutation | Invalide |
|---|---|
| `createRecipe` | `catalog.all(projectId)` |
| `updateRecipe` | `catalog.all(projectId)` + `catalog.detail(recipeId)` |
| `selectRecipe` | — (géré par realtime) |
| `markShoppingDone` | — (géré par realtime) |
| `markAsCooked` | `planner.quickList(projectId)` + `cooking.history(projectId)` |
| `removeSelection` | — (géré par realtime) |
| `generateShoppingList` | `shopping.list(projectId)` |
| `setShoppingItemChecked` | optimistic update + `shopping.list(projectId)` |
| `likeRecipe` / `unlikeRecipe` | `catalog.detail(recipeId)` |
| `addComment` / `deleteComment` | `catalog.comments(recipeId)` |

---

## Plan d'implémentation (5 PR)

### PR 1 — Suppression du code mort
- Supprimer `listQuickListRecipes.ts` (use-case doublon)
- Supprimer 6 exports fantômes dans `recipesFixtureData.ts`
- Supprimer les commentaires `Step N` dans les repositories

### PR 2 — Wording orienté utilisateur final
- Remplacer tout le texte orienté développeur visible par l'utilisateur
- Pages quick list, shopping, `ShoppingListClientCard`, `ShoppingSummaryCard`, `RecipeEditorOutlineCard`
- Supprimer `RecipesPageScaffold` ou vider ses props de tout contenu dev
- Étendre `ProjectToolbarAddActionType` avec `"recipe"`

### PR 3 — Design aligné sur le board
- Supprimer le hero/scaffold sur les pages quick list et shopping
- Aligner la structure de page sur le pattern board (toolbar = en-tête, cartes directement dans la page)

### PR 4 — Stratégie de cache + realtime quick list
- Ajouter `staleTime` sur tous les hooks (catalogue : 7j, quick list : 0, shopping : 5min)
- Implémenter l'abonnement realtime sur `recipe_selections`
- Cibler les invalidations par mutation (tableau ci-dessus)
- Optimiser `generateShoppingList` (hash des sélections pour éviter le DELETE+INSERT inutile)

### PR 5 — États de sélection (pending / shopping_done / cooked)
- Migration : ajouter `status` sur `recipe_selections` (`pending` | `shopping_done`)
- Migration : créer `recipe_cooking_history` (project_id, recipe_id, cooked_at, cooked_by)
- Mettre à jour `generateShoppingList` pour exclure les sélections `shopping_done`
- Ajouter `markShoppingDone` (mutation + realtime)
- Mettre à jour `markSelectionDone` → `markAsCooked` (supprime la sélection + insert dans l'historique)
- UI : deux sections dans la quick list ("À faire" / "Prêt à cuisiner")
- UI : bouton "Courses faites" sur chaque sélection `pending`
- UI : afficher "Cuisiné le [date]" sur la fiche recette

### PR 6 (future) — Recettes publiques, likes et commentaires
- Migration : ajouter `visibility` sur `recipes` (`private` | `public`), `recipe_likes`, `recipe_comments`
- RLS : recettes publiques accessibles en lecture à tous les utilisateurs authentifiés
- UI : toggle visibilité dans l'éditeur
- UI : compteur de likes + bouton like sur la carte et la fiche
- UI : section commentaires dans la fiche (chargement lazy)
- Cache : likes 5 min, commentaires 2 min

---

## Ce qui n'est pas dans ce PRD

- Planification multi-semaines (semaines distinctes avec leurs propres sélections)
- Partage de liste de courses via lien externe
- Import de recettes depuis des URL tierces
- Gestion des stocks / inventaire
