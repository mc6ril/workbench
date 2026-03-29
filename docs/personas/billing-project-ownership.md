# Billing projet et création

## Objectif

Définir un modèle de facturation et de quotas plus simple et plus cohérent avec le produit :

- un utilisateur peut créer **un seul projet actif à la fois**
- un utilisateur peut rejoindre **autant de projets qu'il y est autorisé**
- il n'existe **pas** de notion d'utilisateur payant
- la facturation est portée **uniquement par le projet**
- les permissions restent pilotées par le rôle dans le projet
- l'expérience doit rester compréhensible pour des familles en usage mobile et quotidien

Ce document présente le constat actuel, les limites du modèle actuel, puis la solution cible recommandée.

## Résumé exécutif

La direction retenue est la suivante :

- le compte utilisateur ne porte **aucun plan personnel**
- le quota utilisateur ne sert qu'à répondre à une seule question :
  "occupes-tu déjà un slot de création actif ?"
- chaque projet naît en **free**
- chaque projet porte son propre **statut de facturation**
- les capacités collaboratives dépendent du **projet**
- les permissions dépendent du **rôle projet**
- le billing se gère depuis les **settings du projet** par les admins autorisés

En une phrase :

> un utilisateur peut occuper un seul slot de création actif à la fois, et seul le projet peut être payant

Ce modèle supprime une grande partie de la complexité précédente :

- plus de subscription utilisateur à interpréter dans les écrans projet
- plus de confusion entre statut d'un membre et statut payant du projet
- plus de notion de `billing_owner` à transférer
- plus de couplage fort entre le moyen de paiement utilisé et les règles produit
- une UX plus cohérente avec les personas famille, où seuls certains admins ont besoin d'interagir avec le billing

---

## Constat actuel

### 0. Les personas confirment un besoin fort de simplicité

Les personas produit décrivent un usage :

- familial
- mobile-first
- peu tolérant à la complexité
- centré sur un projet partagé plutôt que sur une logique de compte payant individuel

Concrètement :

- Emma veut un espace commun simple à coordonner
- Lucas peut agir comme co-admin sans vouloir comprendre une logique de plan personnel
- Chloé reste membre du projet et ne doit jamais être exposée à des concepts de billing inutiles

Le modèle de facturation doit donc suivre la structure collaborative du produit, pas ajouter une couche conceptuelle centrée sur l'utilisateur.

### 1. Le produit est déjà structuré autour du projet comme conteneur collaboratif

Dans l'architecture actuelle, le projet est déjà le conteneur principal :

- il contient les membres
- il contient les permissions
- il contient les invitations
- il contient les modules activés

Autrement dit, la collaboration est déjà pensée au niveau projet.

### 2. Les permissions sont déjà project-scoped

Aujourd'hui :

- les rôles sont stockés dans `project_members`
- les permissions `admin`, `member`, `viewer` sont résolues au niveau projet
- le RLS utilise déjà le membership projet comme source de vérité
- les invitations sont rattachées à un `project_id`

Sur l'axe permissionnel, le projet est donc déjà le bon niveau.

### 3. La facturation actuelle reste user-centric

La table `subscriptions` est aujourd'hui rattachée à `user_id`, avec une seule subscription par utilisateur.

Conséquences :

- `useSubscription()` charge le plan de l'utilisateur courant
- les flows Stripe checkout / portail / webhooks sont basés sur `userId`
- la notion de plan actif est aujourd'hui une propriété de la personne

### 4. Certaines règles projet dépendent pourtant déjà du plan utilisateur

Exemples dans l'état actuel :

- la limite `MEMBERS_PER_WORKSPACE` est définie dans les capabilities de plan
- le use case `inviteToProject` reçoit un `currentPlan`
- ce `currentPlan` est injecté depuis l'UI à partir de la subscription du viewer
- les écrans projet utilisent `useFeatureAccess()` qui lit le plan utilisateur

En pratique :

- les permissions suivent déjà le projet
- les entitlements suivent encore l'utilisateur

Le modèle est donc partagé entre deux niveaux différents.

### 5. Le quota de projets existe déjà conceptuellement, mais avec une mauvaise sémantique

Le feature set contient déjà une capacité de type `WORKSPACES`.

Mais dans le modèle actuel, cette capacité est ambiguë :

- elle ressemble à une limite de plan utilisateur
- elle ne distingue pas clairement créer un projet et rejoindre un projet
- elle ne correspond pas exactement à la règle produit visée

La règle cible est pourtant beaucoup plus simple :

- un utilisateur peut créer un projet
- ensuite il ne peut pas en créer un second tant qu'il occupe déjà un slot de création actif
- il peut en revanche rejoindre d'autres projets sans limite spécifique liée à son compte

### Références codebase actuelles

Repères utiles pour relier ce document à l'implémentation actuelle :

- `README.md`
- `supabase/migrations/000003_add_project_members_and_rls.sql`
- `supabase/migrations/000010_subscriptions.sql`
- `src/domains/billing/core/domain/planFeatures.rules.ts`
- `src/domains/billing/presentation/hooks/useSubscription.ts`
- `src/domains/project/core/usecases/invitation/inviteToProject.ts`
- `src/domains/project/presentation/pages/settings/components/ProjectPeopleSettingsSection.tsx`
- `src/domains/project/presentation/components/inviteProjectModal/InviteProjectModal.tsx`

---

## Limites de l'actuel

### 1. Le cas métier "admin sur projet payé" est structurellement bancal

Cas cible :

- Emma crée un projet familial
- Lucas devient admin du projet
- un admin saisit ensuite un moyen de paiement pour activer le billing
- Emma et Lucas peuvent ensuite quitter le projet
- un autre admin peut plus tard gérer le billing du projet

Avec le modèle actuel, l'application raisonne encore trop à partir de l'utilisateur courant, alors que la seule vraie question devrait être :

- ce projet est-il payé ?
- cet admin a-t-il le droit de gérer ce projet ?

### 2. Les entitlements suivent l'utilisateur connecté au lieu du contexte projet

Aujourd'hui, deux admins du même projet peuvent théoriquement voir des règles différentes si leur compte personnel n'a pas le même plan.

Cela pose un problème de cohérence :

- les permissions sont contextuelles au projet
- les limites de collaboration devraient l'être aussi

Sinon on mélange deux questions différentes :

- "ai-je le droit d'agir dans ce projet ?"
- "ce projet dispose-t-il des capacités nécessaires ?"

### 3. La notion d'utilisateur payant n'apporte pas de valeur claire dans ce produit

Dans le modèle ciblé, le vrai sujet n'est pas :

- quel utilisateur paie globalement l'application

Le vrai sujet est :

- quel projet est gratuit
- quel projet est payant

Autrement dit, la monétisation pertinente est portée par le conteneur partagé, pas par la personne.

### 4. Le quota de projets n'a pas besoin d'être lié à un plan utilisateur

Le besoin BDD exprimé est simple :

- éviter qu'un même utilisateur crée une multiplicité de projets

Pour satisfaire ce besoin, il n'est pas nécessaire d'introduire :

- un plan utilisateur
- plusieurs niveaux d'utilisateur payant
- une matrice d'entitlements personnelle

Une simple règle "1 compte = 1 projet créé actif à la fois" répond déjà au besoin.

### 5. Le modèle hybride avec `billing_owner` ajoute de la complexité produit inutile

Dès qu'on introduit un `billing_owner`, il faut gérer :

- son départ du projet
- son transfert
- sa suppression de compte
- la cohérence entre owner métier et moyen de paiement réellement utilisé

Si la responsabilité payante revient au projet lui-même, cette couche n'est plus nécessaire dans le domaine produit.

### 6. Les gains BDD existent, mais ne justifient pas un modèle de billing plus complexe

Limiter la création à un seul projet par utilisateur permet déjà de :

- réduire la prolifération de projets
- limiter la volumétrie dans `projects`
- freiner la croissance des tables liées au projet

Ces gains peuvent être obtenus sans abonnement utilisateur.

### 7. Les personas rendent le billing user-centric encore moins adapté

Dans le produit ciblé :

- le coordinateur familial a besoin d'un réglage simple dans le projet
- le co-parent peut devenir admin ponctuellement et reprendre la gestion du billing si nécessaire
- les autres membres ne doivent pas être perturbés par des notions de payeur, owner ou plan personnel

Un billing user-centric ajoute donc :

- de la charge cognitive
- de l'ambiguïté sur qui peut agir
- des surfaces de réglage au mauvais endroit

---

## Solution

### Principe général

Le modèle cible est volontairement simple :

- le compte utilisateur n'a **pas** de subscription
- le compte utilisateur peut créer **un seul projet actif à la fois**
- le compte utilisateur peut rejoindre **autant de projets qu'il y est autorisé**
- le projet est **free par défaut**
- le projet porte seul son **statut de facturation**
- les permissions restent pilotées par les rôles projet
- les actions de billing vivent dans les **settings projet**

### Règle 1. Il n'existe pas de plan utilisateur

Le compte utilisateur ne doit plus porter de plan produit.

Cela signifie :

- pas de "user free"
- pas de "user pro"
- pas de "user team"

Le compte sert uniquement à :

- s'authentifier
- appartenir à des projets
- occuper au plus un slot de création actif

### Règle 2. Un utilisateur peut créer un seul projet

La règle de quota utilisateur devient :

> un compte peut occuper un seul slot de création actif à la fois

Cette règle ne dépend pas d'un plan.

Elle sert uniquement à limiter la création de projets, pour des raisons :

- produit
- lisibilité de l'expérience
- maîtrise de la volumétrie

Ce slot de création reste occupé tant que le créateur est encore membre du projet qu'il a créé.

S'il quitte ce projet :

- son slot de création est libéré
- il peut créer un nouveau projet

### Règle 3. Un utilisateur peut rejoindre plusieurs projets

Rejoindre un projet ne consomme aucun quota personnel supplémentaire.

Cette règle est essentielle pour permettre :

- la collaboration familiale
- le multi-admin
- la reprise d'un projet par d'autres membres
- le cas "un admin gère un projet payé indépendamment de la personne qui a saisi la carte"

### Règle 4. Le projet porte seul la facturation

Le projet doit être la seule source de vérité pour les entitlements collaboratifs et pour l'état de facturation.

La bonne question n'est plus :

> quel est le plan de l'utilisateur courant ?

Mais :

> quel est le statut de facturation du projet courant ?

### Règle 5. Les permissions restent pilotées par le rôle projet

Le rôle continue de déterminer :

- qui peut inviter
- qui peut gérer les membres
- qui peut modifier le projet
- qui peut accéder aux surfaces d'administration

Ensuite, le statut du projet détermine si l'action est disponible au regard de la facturation.

La décision complète devient :

> l'utilisateur a-t-il le rôle suffisant, et le projet est-il dans un statut qui autorise cette capacité ?

### Règle 6. L'application ne modélise pas "qui paie" comme concept produit

Dans cette version simplifiée :

- peu importe quelle personne a saisi la carte à un instant donné
- peu importe quel admin déclenche le checkout
- peu importe quel membre finance concrètement le projet

Le domaine produit n'a pas besoin d'un `billing_owner`.

Le paiement existe au niveau projet, pas au niveau d'un utilisateur métier.

La bonne modélisation est la suivante :

- le **projet** est l'entité facturée
- la **subscription Stripe** appartient au projet
- le **customer Stripe** appartient au projet
- la **carte bancaire** n'est qu'un moyen de paiement attaché à ce customer Stripe
- les **admins** sont seulement des opérateurs autorisés à gérer ce billing projet

En pratique :

- le projet possède son customer Stripe
- le projet possède sa subscription Stripe
- l'application donne accès aux surfaces de billing selon les permissions projet
- aucun utilisateur n'est "propriétaire" de la facturation au sens métier

Exemple :

- Sarah peut saisir la carte initiale
- Alice et Bob peuvent ensuite quitter le projet
- Michel peut arriver plus tard comme admin
- si le moyen de paiement est encore valide, le projet continue normalement
- sinon Michel met à jour le moyen de paiement du projet

### Règle 7. Le billing doit rester concentré dans les settings projet

Les personas confirment qu'il faut éviter de disperser le billing dans l'application.

Le point d'entrée recommandé est :

- un encart dédié dans les settings du projet

Cet encart doit permettre aux admins autorisés de :

- voir le `billing_status` du projet
- ouvrir le portail de billing
- récupérer les factures
- gérer l'abonnement
- comprendre si une action de paiement est requise

Les membres non-admin :

- n'ont pas besoin de gérer le billing
- ne doivent pas être exposés à une complexité inutile
- continuent à utiliser le projet normalement tant que leurs permissions le permettent

---

## Modèle cible recommandé

### 1. Limiter la création de projet au niveau du créateur actif

Le projet doit pouvoir identifier l'utilisateur qui occupe actuellement son slot de création.

Recommandation :

- ajouter `created_by_user_id` sur `projects`

Ce champ devient la source de vérité pour la règle :

> cet utilisateur occupe-t-il déjà le slot de création d'un autre projet ?

Important :

- `created_by_user_id` ne porte aucun entitlement de billing
- ce n'est pas un rôle
- ce n'est pas un owner produit du projet
- c'est uniquement une information de quota de création actif

Quand le créateur quitte le projet :

- `created_by_user_id` est remis à `NULL`
- le projet continue d'exister normalement
- le créateur récupère la possibilité de créer un nouveau projet

Si l'on souhaite conserver l'historique du tout premier créateur, cela doit être géré séparément :

- via un audit log
- ou via un champ historique distinct non utilisé pour les quotas

### 2. Porter le statut de facturation directement sur le projet

Dans la version simplifiée, il n'est pas nécessaire d'introduire un billing complexe côté utilisateur.

Le strict minimum recommandé est de stocker sur le projet :

- `billing_status`
- `stripe_customer_id`
- `stripe_subscription_id`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`

Deux options d'implémentation existent :

- stocker ces champs directement sur `projects`
- ou créer une petite table `project_billing`

Dans cette version, la solution la plus simple est :

- **ajouter ces champs directement sur `projects`**

### 3. Utiliser un statut projet plutôt qu'un plan utilisateur

Si l'offre ne contient qu'un seul niveau payant, un simple statut projet suffit.

Statuts recommandés :

- `free`
- `active`
- `past_due`
- `canceled`
- `trialing` si nécessaire

Lecture métier :

- `free` : le projet reste dans ses capacités gratuites
- `active` : les capacités payantes du projet sont actives
- `past_due` : problème de paiement, avec éventuelle période de grâce
- `canceled` : fin d'abonnement, avec retour au comportement free selon la politique retenue

### 4. Ne pas introduire de `billing_plan` tant qu'il n'y a qu'un seul niveau payant

Tant que le produit oppose simplement :

- projet gratuit
- projet payant

alors `billing_status` suffit.

Si, plus tard, plusieurs niveaux payants apparaissent, on pourra ajouter :

- `billing_plan`

Mais ce n'est pas nécessaire dans la version cible décrite ici.

### 5. Faire du customer Stripe un attribut du projet

La simplification clé est la suivante :

- un projet correspond à un customer Stripe
- un projet correspond à une subscription Stripe

Conséquence :

- l'app ne raisonne pas en "client Stripe utilisateur"
- l'app raisonne en "client Stripe projet"
- la carte n'est pas interprétée comme l'attribut d'une personne métier
- le moyen de paiement est interchangeable sans impact sur les rôles projet

Cela simplifie :

- les webhooks
- le portail de billing
- l'interprétation des entitlements

---

## Règles métier cibles

### Création de projet

Un utilisateur peut créer un projet si :

- il est authentifié
- il n'existe encore aucun projet avec `created_by_user_id = auth.uid()`

Effets :

- le projet est créé
- `created_by_user_id` est défini
- `billing_status` est initialisé à `free`
- le créateur devient admin du projet

### Rejoindre un projet

Un utilisateur peut rejoindre un projet si :

- il reçoit une invitation valide
- ou il utilise un mécanisme d'accès explicitement prévu par le produit

Rejoindre un projet :

- ne consomme pas de quota de création
- ne dépend pas d'un plan utilisateur
- ne modifie pas le statut de facturation du projet

### Invitation dans un projet

Un utilisateur peut inviter dans un projet si :

- il a la permission projet correspondante
- le projet n'a pas dépassé ses capacités pour son `billing_status`

Le statut personnel du compte n'entre jamais dans la décision.

### Passage d'un projet en payant

Un projet peut passer en payant si :

- un admin autorisé déclenche le checkout projet

Effets :

- le projet reçoit un customer Stripe
- le projet reçoit une subscription Stripe
- le projet reçoit un moyen de paiement valide
- `billing_status` passe à `active` ou `trialing`
- les entitlements payants du projet deviennent disponibles

Exemple famille :

- Emma crée le projet familial et devient admin
- Lucas est ajouté comme co-admin
- l'un ou l'autre peut déclencher le checkout du projet
- le projet devient payant sans qu'aucun "plan utilisateur" n'existe

### Retour au gratuit

Un projet revient en comportement gratuit si :

- son abonnement est annulé et arrivé à échéance
- ou son abonnement est en défaut sans résolution

Dans ce cas :

- le compte utilisateur n'est pas impacté
- les autres projets du même utilisateur ne sont pas impactés
- seul le projet concerné est rétrogradé

### Gestion du billing

Dans cette version simplifiée :

- la gestion du billing est une capacité liée au projet
- elle peut être réservée aux admins
- elle n'est pas liée à l'identité de la personne qui a fourni la carte

Autrement dit :

- un admin peut ouvrir le portail de billing du projet
- un admin peut mettre à jour le moyen de paiement du projet
- un admin peut agir même si la carte a été fournie auparavant par quelqu'un d'autre

Ce que l'application modélise :

- le statut de billing du projet
- le droit pour certains membres de gérer ce billing

Ce qu'elle ne modélise pas :

- un "payeur officiel"
- un "owner de la carte"
- une relation produit durable entre un utilisateur et la facturation du projet

### Notifications et surfaces de gestion

Le billing projet a besoin de deux surfaces distinctes :

- un `billing_email` pour les notifications Stripe liées au paiement
- un encart dans les settings du projet pour les actions manuelles des admins

Le `billing_email` sert pour :

- les reçus
- les échecs de paiement
- les renouvellements
- les annulations

Les settings projet servent pour :

- récupérer la facture
- gérer l'abonnement
- mettre à jour le moyen de paiement
- comprendre l'état courant du projet

### Départ d'un admin

Un admin peut quitter un projet **uniquement s'il reste au moins un autre admin dans le projet**.

Si l'admin est le **dernier admin** :

- le départ est bloqué
- l'admin doit d'abord promouvoir un autre membre au rôle admin
- une fois qu'un autre admin existe, il peut quitter librement

Cette règle s'applique indépendamment du statut de facturation du projet et du rôle de créateur.

Raison :

- un projet sans admin ne peut plus être administré (membres, billing, paramètres)
- cette règle prévient les projets orphelins de gouvernance

### Départ du créateur

Le créateur d'un projet peut quitter le projet.

Cela ne change pas :

- le statut de facturation du projet
- la capacité des autres admins à gérer le billing
- le moyen de paiement éventuellement déjà enregistré sur le projet

Le quota de création est une propriété du **créateur actif**, pas une propriété permanente du projet.

Quand le créateur quitte le projet :

- `created_by_user_id` est remis à `NULL`
- le projet continue d'exister
- le créateur récupère immédiatement la possibilité de créer un nouveau projet

Autrement dit :

- quitter un projet qu'on a créé libère le quota de création
- supprimer le projet n'est pas la seule manière de libérer ce quota

Raison :

- on limite la création simultanée de projets, pas l'historique complet de création d'un utilisateur

### Suppression de compte

Si le créateur supprime son compte :

- le projet ne doit pas être considéré comme "orphelin de facturation"
- le projet continue d'exister avec ses membres et son `billing_status`
- `created_by_user_id` doit être nulifié si le compte disparaît réellement
- le moyen de paiement existant du projet peut continuer à être utilisé tant qu'il reste valide

Le point important est :

- la facturation reste une propriété du projet, pas d'une personne métier

---

## Impacts techniques à prévoir

### 1. Base de données

À prévoir :

- ajout de `created_by_user_id` sur `projects`
- ajout de `billing_status` sur `projects`
- ajout des champs Stripe projet sur `projects`
- index sur `projects.created_by_user_id`

Contrainte recommandée :

- garantir qu'un utilisateur ne puisse occuper qu'un seul slot de création actif

Selon la stratégie retenue, cela peut passer par :

- une vérification applicative avant création
- une contrainte SQL sur `created_by_user_id` non nul
- ou les deux

### 2. Domaine billing

Le domaine billing doit cesser d'être user-centric dans les usages collaboratifs.

À introduire :

- `getProjectBillingStatus(projectId)`
- `openProjectCheckout(projectId)`
- `openProjectBillingPortal(projectId)`
- `handleProjectBillingWebhook(...)`

À retirer progressivement des règles projet :

- la dépendance au plan utilisateur

### 3. Domaine project

Le domaine project ne doit plus recevoir un `currentPlan` utilisateur pour décider d'une règle projet.

Exemple cible :

- `inviteToProject(...)` ne reçoit plus de plan du viewer
- le use case lit le `billing_status` du projet
- il applique les limites du projet

### 4. Présentation

Les écrans projet doivent arrêter de dépendre de `useSubscription()` utilisateur quand ils parlent d'entitlements projet.

À la place :

- `useProjectBillingStatus(projectId)`
- ou `useProjectEntitlements(projectId)`

La page compte utilisateur n'a plus besoin d'afficher un abonnement personnel.

Les settings projet doivent devenir la surface principale pour :

- afficher le statut `free` / `active` / `past_due`
- proposer l'upgrade d'un projet
- récupérer les factures
- gérer l'abonnement
- afficher les états d'alerte de paiement aux admins concernés

### 5. Stripe

Le checkout et le portail doivent être pensés autour de :

- `projectId`

Et non plus autour de :

- `userId`

Conséquences :

- les metadata Stripe doivent contenir le `projectId`
- les webhooks doivent retrouver le projet
- l'état Stripe doit mettre à jour le `billing_status` du projet
- le moyen de paiement doit être compris comme un attribut du customer Stripe du projet
- aucun mapping métier "carte => owner applicatif" n'est nécessaire

---

## Plan de migration recommandé

### Phase 1. Simplification du modèle

Objectif :

- sortir du modèle user subscription pour tout ce qui concerne les projets

Actions :

- introduire `created_by_user_id` sur `projects`
- backfiller `created_by_user_id` quand c'est possible de manière fiable
- introduire `billing_status` sur `projects`
- initialiser tous les projets existants à `free`
- ajouter les champs Stripe projet
- garder temporairement `subscriptions` côté utilisateur uniquement le temps de migrer le code

### Phase 2. Migration des règles projet

Actions :

- faire passer invitations, gestion des membres et rôles avancés sur le `billing_status` projet
- retirer les appels projet à `useSubscription()`
- retirer les `currentPlan` injectés depuis l'UI dans les use cases projet

### Phase 3. Nettoyage fonctionnel

Actions :

- retirer la notion de plan utilisateur des écrans qui n'en ont plus besoin
- déplacer les surfaces de billing vers le projet
- simplifier les webhooks et repositories autour du projet

---

## Cas limites à décider explicitement

### 0. Email de facturation du projet

Le customer Stripe d'un projet a besoin d'un email pour les récépissés et les notifications de paiement (échec de prélèvement, renouvellement, annulation).

Décision retenue :

- ajouter un champ `billing_email` sur le projet
- cet email est renseigné lors du checkout
- il peut être mis à jour par n'importe quel admin via le portail de billing du projet
- il est distinct de l'email personnel de tout membre du projet

Cela garantit que les notifications Stripe arrivent toujours, même si l'admin qui a saisi la carte a quitté le projet.

En parallèle :

- les actions de gestion restent disponibles depuis les settings du projet
- l'email de facturation n'est pas le seul point de contact UX
- les admins doivent aussi voir l'état de billing directement dans l'interface

### 1. Que se passe-t-il quand un projet payant repasse en `free` alors qu'il dépasse les limites gratuites ?

Exemples :

- plus de membres que la limite gratuite
- rôles avancés déjà utilisés

Décision à prendre :

- soit on bloque certaines nouvelles actions mais on conserve l'existant
- soit on force une remise en conformité

Recommandation :

- conserver l'existant
- bloquer uniquement les nouvelles actions non compatibles avec `free`

### 2. Que se passe-t-il si le créateur quitte le projet ?

Décision recommandée :

- cela ne change rien au billing du projet
- `created_by_user_id` est remis à `NULL`
- le quota de création est libéré immédiatement
- le moyen de paiement existant continue à servir tant qu'il reste valide

### 3. Que se passe-t-il si les admins historiques quittent le projet mais que le paiement existe encore ?

Décision recommandée :

- le projet continue normalement tant que son customer Stripe et son moyen de paiement restent valides
- un nouvel admin peut reprendre la gestion du billing sans transfert d'ownership
- si le paiement échoue plus tard, ce nouvel admin peut mettre à jour le moyen de paiement du projet

### 4. Que se passe-t-il si aucun admin ne reste sur un projet payant ?

Ce cas ne relève plus d'un `billing_owner`, mais reste un sujet d'administration.

Décision recommandée :

- conserver les règles actuelles empêchant un projet de se retrouver sans admin

### 5. Que se passe-t-il si le backfill de `created_by_user_id` est ambigu sur des projets historiques ?

Décision recommandée :

- ne pas inventer une valeur
- laisser le champ nullable pendant la migration
- résoudre manuellement les cas ambigus avant d'activer une contrainte stricte

---

## Ce qu'il ne faut pas faire

### 1. Ne pas continuer à utiliser le plan utilisateur pour des règles projet

Cela recrée exactement le problème initial.

### 2. Ne pas limiter le nombre de projets rejoints

Cela casserait la collaboration et n'apporterait pas la simplification recherchée.

### 3. Ne pas réintroduire un `billing_owner` sans besoin fort

Cela recrée immédiatement des problèmes de transfert, de départ et de suppression de compte.

### 4. Ne pas sur-modéliser trop tôt le billing

Tant qu'il n'existe qu'un seul niveau payant, un `billing_status` projet est suffisant.

---

## Décision recommandée

Décision cible :

- **un utilisateur peut créer un seul projet actif à la fois**
- **un utilisateur peut rejoindre autant de projets qu'il veut**
- **il n'existe pas de plan utilisateur**
- **le projet est gratuit par défaut**
- **le projet porte seul son statut de facturation**
- **les permissions restent pilotées par le rôle projet**
- **le billing se gère depuis les settings du projet par les admins autorisés**

En une phrase :

> le compte peut occuper un seul slot de création actif à la fois, mais seul le projet peut devenir payant

Ce modèle est :

- plus simple à expliquer
- plus simple à implémenter
- plus cohérent avec le projet comme conteneur collaboratif
- compatible avec le cas où n'importe quel admin peut gérer un projet payé
- suffisant pour atteindre l'objectif de maîtrise de volumétrie côté BDD
