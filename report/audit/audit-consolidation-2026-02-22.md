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
| Sécurité     | 1       | 2         | 3      |
| Architecture | 0       | 5         | 1      |
| Performance  | 0       | 5         | 2      |
| **Total**    | **1**   | **12**    | **6**  |

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
| S8 | Client-side `getSession()` sans validation serveur | `src/infrastructure/supabase/auth/AuthRepository.supabase.ts:229-252` | Acceptable pour UX côté client, vérifier côté serveur pour les opérations critiques |
| S10 | Middleware fail-open en cas d'erreur | `middleware.ts:118-127` | Acceptable avec defense-in-depth (layouts + RLS), surveiller les erreurs |

### Architecture

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| A3 | Hooks presentation importent directement depuis `infrastructure/` (composition root pattern) | 46 hooks dans `src/presentation/hooks/` | Acceptable comme composition root, documenter le choix |
| A4 | Server layouts importent directement depuis `infrastructure/` | `src/app/(auth)/layout.tsx`, `(public)/layout.tsx` | Acceptable pour SSR, même pattern que A3 |
| A5 | `useDeleteUser` utilise `fetch()` brut au lieu d'un usecase + repository | `src/presentation/hooks/auth/useDeleteUser.ts:19-30` | Documenter comme exception (nécessite `service_role` côté serveur) |
| A6 | Styles inline dans Container, Tooltip, DraggableItem | `src/presentation/components/ui/Container/index.tsx:59`, `Tooltip/index.tsx:236`, `DraggableItem/index.tsx:131` | Exception acceptable pour le positionnement dynamique |
| A8 | `!important` dans les SCSS (pour `prefers-reduced-motion`) | 5 fichiers de pages SCSS | Exception acceptable pour l'accessibilité |

### Performance

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| P6 | Fonctions inline dans les `.map()` de 6+ fichiers | `BoardColumn.tsx:81`, `RecentActivityWidget.tsx:96`, `MyWorkWidget.tsx:73`, `ShortcutsWidget.tsx:76` | Extraire avec `useCallback` ou pattern `data-id` |
| P7 | Handlers non mémorisés dans `TicketListItem` | `src/presentation/components/ticketListItem/TicketListItem.tsx:46-62` | Wrapper avec `useCallback` |
| P9 | `THEME_OPTIONS_KEYS.map()` crée un nouveau tableau à chaque render | `src/presentation/pages/account/index.tsx:509` | Mémoriser avec `useMemo` |
| P10 | Aucun `select` utilisé dans les 30+ hooks React Query | Tous les hooks dans `src/presentation/hooks/` | Ajouter `select` pour ne sélectionner que les données nécessaires |
| P13 | Pages statiques rendues comme Client Components | `legal/page.tsx`, `pricing/page.tsx` | Considérer les Server Components pour le contenu statique |

---

## ℹ️ Risque faible (LOW)

### Sécurité

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| S15 | Configuration cookies non explicite | `@supabase/ssr` | Vérifier les defaults (`HttpOnly`, `Secure`, `SameSite`) |
| S16 | Protection open redirect correcte ✅ | `src/app/auth/callback/route.ts:15-18` | Aucune action requise |
| S17 | `.cursor/rules/` couvert par `.gitignore` | `.gitignore:61-63` | Surveiller si le whitelist s'étend |

### Architecture

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| A12 | Couleurs hex hardcodées dans les CSS custom properties des thèmes | `src/styles/themes.scss:20` | Acceptable — source de vérité pour les tokens de design |

### Performance

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| P16 | Concaténation de classes CSS à chaque render | Multiples composants | `useMemo` si le composant est coûteux |
| P22 | `react-hook-form` dans 4+ pages (acceptable) | Auth + account pages | Acceptable, code splitting si les pages deviennent lourdes |

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

## Corrections appliquées (branche `fix/audit-consolidation`)

### HIGH

- **S2–S6** : Upgrade Next.js, security headers, sanitisation erreurs API, rate limiting, allowedDevOrigins

### MEDIUM

- **S7** : Middleware — `getSession()` remplacé par `getUser()`
- **S9** : CSRF — Vérification du header `Origin` sur checkout, portal et delete-user
- **S11** : Password `MIN_LENGTH` passé de 6 à 8
- **A1–A2** : `mapStripeStatus` déplacé dans le domain, API routes utilisent les usecases
- **A7** : DraggableItem aria-label — clé i18n ajoutée
- **P1–P5** : Code splitting settings, barrel imports supprimés, `React.memo` sur 8 composants, Avatar width/height
- **P8** : `Intl.DateTimeFormat` mémorisé hors composant
- **P11** : `@next/bundle-analyzer` installé et configuré (`ANALYZE=true`)
- **P12** : Board page chargée dynamiquement via `next/dynamic`

### LOW

- **S13** : `console.error` remplacé par `createLoggerFactory().forScope()` dans layouts, API routes et infrastructure
- **S14** : `package-lock.json` supprimé (yarn est le gestionnaire principal)
- **A9** : `useToastStore` — timers trackés dans un `Map`, annulés dans `removeToast`
- **A10** : `registerLocaleGetter` déplacé de module-level vers `LocaleSyncProvider` (useEffect)
- **A11** : `font-size: 16px` extrait en variable `$font-size-root` dans `typography.scss`
- **P14** : `TicketCard.handleEdit` wrappé avec `useCallback`
- **P15** : `ShortcutsWidget.defaultShortcuts` wrappé avec `useMemo`
- **P17** : `ariaLabelParts` dans `TicketCard` et `TicketListItem` wrappés avec `useMemo`
- **P18** : `enabled: !!session` ajouté sur `useProjectsWithStats` et `useReclaimableProjects`
- **P19** : Query key `ticket-assignees` centralisée dans `queryKeys.tickets.assignees()`
- **P20** : `setTimeout` dans `useToastStore` — ID stocké et annulé dans `removeToast`
- **P21** : `setTimeout` dans `WorkspacePage` nettoyé via `useEffect` cleanup
- **P23** : Page backlog — strings hardcodées remplacées par i18n

## Actions restantes

1. **Rotation des secrets** — Rotation immédiate de toutes les clés exposées (action manuelle Supabase + Stripe)
2. **Points MEDIUM restants** — Acceptés par design (S8, S10, A3–A6, A8) ou à traiter incrémentalement (P6, P7, P9, P10, P13)
3. **Points LOW restants** — S15 (vérif cookies), A12 (acceptable), P16 (micro-optimisation), P22 (acceptable)
