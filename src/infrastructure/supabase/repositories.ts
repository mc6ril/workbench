/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/shared/client-browser";

import { createAuthRepository } from "./auth/AuthRepository.supabase";
import { createBoardRepository } from "./board/BoardRepository.supabase";
import { createEpicRepository } from "./epic/EpicRepository.supabase";
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
export const epicRepository = createEpicRepository(
  createSupabaseBrowserClient()
);
export const boardRepository = createBoardRepository(
  createSupabaseBrowserClient()
);

// Factory functions for server contexts (Server Components, Server Actions)
export { createAuthRepository } from "./auth/AuthRepository.supabase";
export { createBoardRepository } from "./board/BoardRepository.supabase";
export { createEpicRepository } from "./epic/EpicRepository.supabase";
export { createProjectRepository } from "./project/ProjectRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
