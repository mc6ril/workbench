/**
 * Bridge export for current profile access across domains.
 *
 * Profile hooks are implemented in `domains/profile` because they depend on
 * profile queries and repositories. Other layers import them from here to
 * avoid coupling directly to a domain owner.
 *
 * `useCurrentUserProfile` is kept as a compatibility alias during migration.
 */
export {
  useCurrentUserProfile,
  useMyProfile,
} from "@/domains/profile/presentation/hooks/profile/useMyProfile";
