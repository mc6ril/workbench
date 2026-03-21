/**
 * Bridge export for session access across domains.
 *
 * Session hooks are implemented in `domains/session` because current identity
 * state is shared across billing, board, profile, project, and auth surfaces.
 *
 * All domains import session reads from here, not from another domain owner.
 */
export {
  useCanUpdatePassword,
  useSession,
} from "@/domains/session/presentation/hooks";
