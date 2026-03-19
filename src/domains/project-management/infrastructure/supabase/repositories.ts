/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";
import { createRealtimeRepository } from "@/modules/board/infrastructure/supabase/realtime/RealtimeRepository.supabase";
import { createUserProfileRepository } from "@/domains/auth/infrastructure/supabase/userProfile/UserProfileRepository.supabase";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createBoardRepository } from "./board/BoardRepository.supabase";
import { createEpicRepository } from "./epic/EpicRepository.supabase";
import { createLabelRepository } from "./label/LabelRepository.supabase";
import { createSprintRepository } from "./sprint/SprintRepository.supabase";
import { createTicketRepository } from "./ticket/TicketRepository.supabase";

export const ticketRepository = createTicketRepository(
  createSupabaseBrowserClient()
);
export const epicRepository = createEpicRepository(
  createSupabaseBrowserClient()
);
export const boardRepository = createBoardRepository(
  createSupabaseBrowserClient()
);
export const commentRepository = createCommentRepository(
  createSupabaseBrowserClient()
);
export const sprintRepository = createSprintRepository(
  createSupabaseBrowserClient()
);

export const labelRepository = createLabelRepository(
  createSupabaseBrowserClient()
);
export const userProfileRepository = createUserProfileRepository(
  createSupabaseBrowserClient()
);

/**
 * Build a realtime repository on demand.
 * This avoids eager browser-client creation at module evaluation time.
 */
export const getRealtimeRepository = () => {
  return createRealtimeRepository(createSupabaseBrowserClient());
};

// Factory functions for server contexts (Server Components, Server Actions)
export { createBoardRepository } from "./board/BoardRepository.supabase";
export { createEpicRepository } from "./epic/EpicRepository.supabase";
export { createLabelRepository } from "./label/LabelRepository.supabase";
export { createSprintRepository } from "./sprint/SprintRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
export { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";
export { createRealtimeRepository } from "@/modules/board/infrastructure/supabase/realtime/RealtimeRepository.supabase";
export { createUserProfileRepository } from "@/domains/auth/infrastructure/supabase/userProfile/UserProfileRepository.supabase";
