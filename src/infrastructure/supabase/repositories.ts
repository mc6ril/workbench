/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/shared/client-browser";

import { createAuthRepository } from "./auth/AuthRepository.supabase";
import { createBoardRepository } from "./board/BoardRepository.supabase";
import { createEpicRepository } from "./epic/EpicRepository.supabase";
import { createInvitationRepository } from "./invitation/InvitationRepository.supabase";
import { createMemberRepository } from "./member/MemberRepository.supabase";
import { createProjectRepository } from "./project/ProjectRepository.supabase";
import { createSubscriptionRepository } from "./subscription/SubscriptionRepository.supabase";
import { createTicketRepository } from "./ticket/TicketRepository.supabase";
import { createUserProfileRepository } from "./userProfile/UserProfileRepository.supabase";

// Browser instances for React Query hooks (Client Components)
export const authRepository = createAuthRepository(
  createSupabaseBrowserClient()
);
export const projectRepository = createProjectRepository(
  createSupabaseBrowserClient()
);
export const ticketRepository = createTicketRepository(
  createSupabaseBrowserClient()
);
export const epicRepository = createEpicRepository(
  createSupabaseBrowserClient()
);
export const boardRepository = createBoardRepository(
  createSupabaseBrowserClient()
);

export const invitationRepository = createInvitationRepository(
  createSupabaseBrowserClient()
);
export const memberRepository = createMemberRepository(
  createSupabaseBrowserClient()
);
export const userProfileRepository = createUserProfileRepository(
  createSupabaseBrowserClient()
);

/**
 * Browser-side subscription repository (read-only via RLS).
 * Uses the browser client for reads. Admin client is not available in browser context,
 * so writes must go through API routes that use server-side factories.
 */
export const subscriptionRepository = createSubscriptionRepository(
  createSupabaseBrowserClient(),
  createSupabaseBrowserClient()
);

// Factory functions for server contexts (Server Components, Server Actions)
export { createAuthRepository } from "./auth/AuthRepository.supabase";
export { createBoardRepository } from "./board/BoardRepository.supabase";
export { createEpicRepository } from "./epic/EpicRepository.supabase";
export { createInvitationRepository } from "./invitation/InvitationRepository.supabase";
export { createMemberRepository } from "./member/MemberRepository.supabase";
export { createProjectRepository } from "./project/ProjectRepository.supabase";
export { createSubscriptionRepository } from "./subscription/SubscriptionRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
export { createUserProfileRepository } from "./userProfile/UserProfileRepository.supabase";
