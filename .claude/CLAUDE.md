@AGENTS.md

## Conventions de code

- Ne jamais utiliser `any` en TypeScript, utiliser `unknown` + narrowing
- Les composants React doivent être des fonctions nommées (pas d'export default arrow)
- Pas de commentaires sauf si le WHY est non-évident
- Les Server Components ne doivent jamais importer depuis un fichier `use client`
- Toujours utiliser le type Interface pour les classes
- Toujours utiliser les bracket pour les retours de if

## Design system

Ne jamais utiliser de balises HTML textuelles brutes — toujours passer par les composants du design system (src/shared/design-system) :

- `<p>`, `<span>` → `<Text>`
- `<h1>`, `<h2>`, `<h3>`... → `<Title>`
- `<button>` → `<Button>`
- Et ainsi de suite pour tout autre élément textuel ou interactif
- Avant utilisation d'une balise textuel, vérifier qu'un équivalent n'existe pas déja dans le design system
- Eviter de créer des custom class pour les balises. Le style est déjà fournit par le composant du design system. Double vérification est demandé avant d'écrire une custom class

## Cache react-query

React Query est la source de vérité côté client. Avant tout appel serveur, vérifier si la donnée est déjà en cache.

**Données mises en cache :**

- `auth.getClaims()` → identité de l'utilisateur connecté (voir shape ci-dessous)
- `projectId` → clé racine de toutes les queries projet (tickets, board, recipes, membres, invitations…)

**Shape de `auth.getClaims()` :**

```ts
{
  sub: string,           // userId
  email: string,
  app_metadata: { is_superuser: boolean, provider: string },
  user_metadata: {
    avatar_url: string,
    display_name: string,
    preferences: { emailNotifications: boolean, language: string, theme: string }
  },
  role: string,
  is_anonymous: boolean
}
```

**Stratégie de cache :**

- Maximiser le `staleTime` pour les données stables (profil, config projet, shopping list → `Infinity`)
- Invalider le cache ciblé après mutation, jamais au global
- Ne jamais refetch une donnée déjà disponible en cache react-query

## Performance & navigation

Dans les pages `[projectId]/` et `/account`, éviter les `await` bloquants dans les Server Components. Préférer le lazy loading (Suspense + streaming) : l'utilisateur perçoit la navigation immédiatement, les données non-critiques arrivent ensuite. Réserver `await` aux données critiques au rendu initial (ex. auth, guard d'accès).

## Patterns interdits

- Pas de `useEffect` pour synchroniser du state — utiliser `useMemo` ou dériver
- Pas de `index.ts` barrel files dans les domaines
