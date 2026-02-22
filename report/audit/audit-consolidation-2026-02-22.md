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

## Synthèse des points restants

| Audit        | 🔴 HIGH | ⚠️ MEDIUM | ℹ️ LOW |
|--------------|---------|-----------|--------|
| Sécurité     | 1       | 2         | 3      |
| Architecture | 0       | 5         | 1      |
| Performance  | 0       | 4         | 2      |
| **Total**    | **1**   | **11**    | **6**  |

---

## 🔴 HIGH — Action manuelle requise

| #  | Problème | Recommandation |
|----|----------|----------------|
| S1 | Secrets exposés dans `.env.local` (service role key, Stripe keys) | Rotation immédiate des clés dans les dashboards Supabase + Stripe |

---

## ⚠️ MEDIUM — Acceptés par design

### Sécurité

| #  | Problème | Statut |
|----|----------|--------|
| S8 | Client-side `getSession()` sans validation serveur | Acceptable — UX côté client, sécurité assurée par RLS + layouts serveur |
| S10 | Middleware fail-open en cas d'erreur | Acceptable — defense-in-depth (layouts + RLS), documenté |

### Architecture

| #  | Problème | Statut |
|----|----------|--------|
| A3 | Hooks presentation importent directement depuis `infrastructure/` | Acceptable — composition root pattern, standard Next.js |
| A4 | Server layouts importent directement depuis `infrastructure/` | Acceptable — même pattern que A3 pour SSR |
| A5 | `useDeleteUser` utilise `fetch()` brut | Acceptable — exception documentée (nécessite `service_role` côté serveur) |
| A6 | Styles inline dans Container, Tooltip, DraggableItem | Acceptable — exception pour positionnement dynamique |
| A8 | `!important` dans les SCSS (`prefers-reduced-motion`) | Acceptable — exception accessibilité |

### Performance — À traiter incrémentalement

| #  | Problème | Fichier | Recommandation |
|----|----------|---------|----------------|
| P6 | Fonctions inline dans les `.map()` | `BoardColumn`, `RecentActivityWidget`, `MyWorkWidget`, `ShortcutsWidget` | Extraire avec `useCallback` ou pattern `data-id` |
| P9 | `THEME_OPTIONS_KEYS.map()` recrée un tableau à chaque render | `src/presentation/pages/account/index.tsx` | Mémoriser avec `useMemo` |
| P10 | Aucun `select` dans les 30+ hooks React Query | `src/presentation/hooks/` | Ajouter `select` quand les hooks grandissent |
| P13 | Pages statiques rendues comme Client Components | `legal/page.tsx`, `pricing/page.tsx` | Refactor vers Server Components |

---

## ℹ️ LOW — Points mineurs / acceptables

| #  | Problème | Statut |
|----|----------|--------|
| S15 | Configuration cookies non explicite (`@supabase/ssr`) | À vérifier : defaults `HttpOnly`, `Secure`, `SameSite` |
| S16 | Protection open redirect | ✅ Correcte, aucune action |
| S17 | `.cursor/rules/` couvert par `.gitignore` | Surveiller si le whitelist s'étend |
| A12 | Couleurs hex dans les CSS custom properties des thèmes | Acceptable — source de vérité pour les tokens de design |
| P16 | Concaténation de classes CSS à chaque render | Micro-optimisation, `useMemo` si le composant devient coûteux |
| P22 | `react-hook-form` dans 4+ pages | Acceptable, code splitting si les pages deviennent lourdes |

---

## Corrections déjà appliquées (branche `fix/audit-consolidation`)

**33 points corrigés sur 39 identifiés** — 3 commits

- **HIGH** : S2–S6 (upgrade Next.js, security headers, sanitisation erreurs API, rate limiting, allowedDevOrigins)
- **MEDIUM** : S7 (getUser middleware), S9 (CSRF origin), S11 (password 8 chars), A1–A2 (architecture API routes), A7 (i18n DraggableItem), P1–P5 (code splitting, barrel imports, React.memo, Avatar), P7 (useCallback TicketListItem), P8 (Intl.DateTimeFormat), P11 (bundle-analyzer), P12 (board dynamic)
- **LOW** : S13 (logger centralisé), S14 (double lock file), A9+P20 (toast timers), A10 (locale provider), A11 (font-size variable), P14 (useCallback TicketCard), P15 (useMemo shortcuts), P17 (useMemo ariaLabel), P18 (enabled queries), P19 (query keys), P21 (setTimeout cleanup), P23 (i18n backlog)
