---
Generated: 2026-02-22 14:00:00
Report Type: audit
Command: audit-consolidation
---

# Rapport d'audit consolidé — Sécurité, Architecture, Performance

**Date** : 22 février 2026
**Périmètre** : Application Next.js + Supabase (workbench)
**Score architecture** : 8.5 / 10

---

## Synthèse

| Audit        | 🔴 HIGH | ⚠️ MEDIUM | ℹ️ LOW |
|--------------|---------|-----------|--------|
| Sécurité     | 1       | 5         | 5      |
| Architecture | 0       | 6         | 4      |
| Performance  | 0       | 8         | 10     |
| **Total**    | **1**   | **19**    | **19** |

---

## 🔴 Risque élevé (HIGH)

### Sécurité

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| S1 | Secrets exposés dans `.env.local` (service role key, Stripe keys) | `.env.local` | Rotation immédiate des clés, utiliser un secrets manager |

---

## ⚠️ Risque moyen (MEDIUM)

### Sécurité

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| S7 | Middleware utilise `getSession()` au lieu de `getUser()` pour le check auth initial | `middleware.ts:86` | Remplacer par `getUser()` ou documenter le trade-off |
| S8 | Client-side `getSession()` sans validation serveur | `src/infrastructure/supabase/auth/AuthRepository.supabase.ts:229-252` | Acceptable pour UX côté client, vérifier côté serveur pour les opérations critiques |
| S9 | Aucune protection CSRF sur les API routes | `src/app/api/` | Implémenter des tokens CSRF ou vérifier le header `Origin` |
| S10 | Middleware fail-open en cas d'erreur | `middleware.ts:118-127` | Acceptable avec defense-in-depth (layouts + RLS), surveiller les erreurs |
| S11 | Politique de mot de passe faible (min 6 caractères) | `src/shared/constants/app.ts:35` | Augmenter `MIN_LENGTH` à 8 minimum |

### Architecture

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| A3 | Hooks presentation importent directement depuis `infrastructure/` (composition root pattern) | 46 hooks dans `src/presentation/hooks/` | Acceptable comme composition root, documenter le choix |
| A4 | Server layouts importent directement depuis `infrastructure/` | `src/app/(auth)/layout.tsx`, `(public)/layout.tsx` | Acceptable pour SSR, même pattern que A3 |
| A5 | `useDeleteUser` utilise `fetch()` brut au lieu d'un usecase + repository | `src/presentation/hooks/auth/useDeleteUser.ts:19-30` | Documenter comme exception (nécessite `service_role` côté serveur) |
| A6 | Styles inline dans Container, Tooltip, DraggableItem | `src/presentation/components/ui/Container/index.tsx:59`, `Tooltip/index.tsx:236`, `DraggableItem/index.tsx:131` | Exception acceptable pour le positionnement dynamique |
| A7 | String hardcodée dans l'attribut accessibility de DraggableItem | `src/presentation/components/ui/DraggableItem/index.tsx:144` | Ajouter une clé i18n |
| A8 | `!important` dans les SCSS (pour `prefers-reduced-motion`) | 5 fichiers de pages SCSS | Exception acceptable pour l'accessibilité |

### Performance

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| P6 | Fonctions inline dans les `.map()` de 6+ fichiers | `BoardColumn.tsx:81`, `RecentActivityWidget.tsx:96`, `MyWorkWidget.tsx:73`, `ShortcutsWidget.tsx:76` | Extraire avec `useCallback` ou pattern `data-id` |
| P7 | Handlers non mémorisés dans `TicketListItem` | `src/presentation/components/ticketListItem/TicketListItem.tsx:46-62` | Wrapper avec `useCallback` |
| P8 | `Intl.DateTimeFormat` recréé à chaque appel dans la boucle | `src/presentation/components/recentActivityWidget/RecentActivityWidget.tsx:40-49` | Mémoriser l'instance hors du composant |
| P9 | `THEME_OPTIONS_KEYS.map()` crée un nouveau tableau à chaque render | `src/presentation/pages/account/index.tsx:509` | Mémoriser avec `useMemo` |
| P10 | Aucun `select` utilisé dans les 30+ hooks React Query | Tous les hooks dans `src/presentation/hooks/` | Ajouter `select` pour ne sélectionner que les données nécessaires |
| P11 | Pas de bundle analyzer configuré | `next.config.ts` | Ajouter `@next/bundle-analyzer` |
| P12 | `@dnd-kit` importé statiquement sur la page board | `src/presentation/pages/board/index.tsx:3-10` | Utiliser `next/dynamic` |
| P13 | Pages statiques rendues comme Client Components | `legal/page.tsx`, `pricing/page.tsx` | Considérer les Server Components pour le contenu statique |

---

## ℹ️ Risque faible (LOW)

### Sécurité

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| S13 | `console.error` utilisé au lieu de `JsonConsoleLogger` dans le code de production | Layouts, infrastructure | Remplacer par le logger centralisé |
| S14 | Double lock files (yarn.lock + package-lock.json) | Racine du projet | Choisir un seul gestionnaire de paquets |
| S15 | Configuration cookies non explicite | `@supabase/ssr` | Vérifier les defaults (`HttpOnly`, `Secure`, `SameSite`) |
| S16 | Protection open redirect correcte ✅ | `src/app/auth/callback/route.ts:15-18` | Aucune action requise |
| S17 | `.cursor/rules/` couvert par `.gitignore` | `.gitignore:61-63` | Surveiller si le whitelist s'étend |

### Architecture

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| A9 | `useToastStore` contient un `setTimeout` (side effect) | `src/presentation/stores/useToastStore.ts:37-41` | Déplacer l'auto-dismiss dans un hook dédié |
| A10 | `useLocaleStore` appelle une fonction d'enregistrement au niveau module | `src/presentation/stores/useLocaleStore.ts:24` | Déplacer dans un provider |
| A11 | Font-size de base hardcodée dans global SCSS | `src/styles/global.scss:82` | Extraire en variable |
| A12 | Couleurs hex hardcodées dans les CSS custom properties des thèmes | `src/styles/themes.scss:20` | Acceptable — source de vérité pour les tokens de design |

### Performance

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| P14 | `handleEdit` non mémorisé dans `TicketCard` | `src/presentation/components/ticketCard/TicketCard.tsx:49-53` | Wrapper avec `useCallback` |
| P15 | `defaultShortcuts` recréé à chaque render | `src/presentation/components/shortcutsWidget/ShortcutsWidget.tsx:36-41` | Wrapper avec `useMemo` |
| P16 | Concaténation de classes CSS à chaque render | Multiples composants | `useMemo` si le composant est coûteux |
| P17 | `ariaLabelParts` recréé à chaque render | `TicketCard.tsx`, `TicketListItem.tsx` | Calculer dans `useMemo` |
| P18 | Deux queries sans option `enabled` | `useProjectsWithStats.ts`, `useReclaimableProjects.ts` | Ajouter `enabled: !!session` |
| P19 | Query keys `ticket-assignees` non centralisées | `useTicketAssignees.ts:20,46,75` | Ajouter dans le factory `queryKeys` |
| P20 | `setTimeout` dans toast store jamais annulé | `useToastStore.ts:37-41` | Stocker l'ID et annuler dans `removeToast` |
| P21 | `setTimeout` dans WorkspacePage non nettoyé | `src/presentation/pages/workspace/index.tsx:175-178` | Nettoyer dans `useEffect` cleanup |
| P22 | `react-hook-form` dans 4+ pages (acceptable) | Auth + account pages | Acceptable, code splitting si les pages deviennent lourdes |
| P23 | Page backlog avec strings hardcodées | `src/app/(auth)/[projectId]/backlog/page.tsx:16` | Utiliser le système i18n |

---

## ✅ Points positifs

- Architecture globale solide (score 8.5/10) : domain pur, ports/usecases bien respectés
- React Query bien configuré (`staleTime: 5min`, `retry: 1`, pas de refetch agressif)
- Event listeners correctement nettoyés dans tous les composants
- SCSS bien structuré (BEM, variables centralisées, pas de valeurs hardcodées)
- Protection open redirect correcte dans `auth/callback`
- Server Components utilisés pour les layouts d'authentification
- `TicketCard` et `EpicCard` déjà wrappés avec `React.memo`
- Nesting SCSS raisonnable, pas de sélecteurs profonds
- Query keys centralisées avec un factory pattern

---

## Actions restantes

1. **Rotation des secrets** — Rotation immédiate de toutes les clés exposées (action manuelle Supabase + Stripe)
