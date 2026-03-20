/**
 * Bridge export for current profile access across domains.
 *
 * `useCurrentUserProfile` is implemented in `domains/profile` because it
 * depends on profile queries and repositories. Other layers import it from
 * here to avoid coupling directly to a domain owner.
 */
export { useCurrentUserProfile } from "@/domains/profile/presentation/hooks/profile/useCurrentUserProfile";
