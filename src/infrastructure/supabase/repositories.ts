/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/shared/client-browser";

import { createAuthRepository } from "./auth/AuthRepository.supabase";
import { createProjectRepository } from "./project/ProjectRepository.supabase";
import { createTicketRepository } from "./ticket/TicketRepository.supabase";

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

// Factory functions for server contexts (Server Components, Server Actions)
export { createAuthRepository } from "./auth/AuthRepository.supabase";
export { createProjectRepository } from "./project/ProjectRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
