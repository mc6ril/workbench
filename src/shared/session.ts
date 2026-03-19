/**
 * Bridge export for session access across domains.
 *
 * `useSession` is implemented in `domains/auth` because it depends on auth
 * infrastructure. However, it is a cross-cutting concern used by billing,
 * board, and other domains that should not import from each other.
 *
 * All domains import `useSession` from here — not from `@/domains/auth`.
 */
export { useSession } from "@/domains/auth/presentation/hooks/session/useSession";
