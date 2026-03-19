/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createBoardRepository } from "./board/BoardRepository.supabase";
import { createEpicRepository } from "./epic/EpicRepository.supabase";
import { createLabelRepository } from "./label/LabelRepository.supabase";
import { createProjectLookupRepository } from "./project/ProjectLookupRepository.supabase";
import { createSprintRepository } from "./sprint/SprintRepository.supabase";
import { createTicketRepository } from "./ticket/TicketRepository.supabase";

import { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";
import { createRealtimeRepository } from "@/modules/board/infrastructure/supabase/realtime/RealtimeRepository.supabase";

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

export const projectLookupRepository = createProjectLookupRepository(
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
export { createProjectLookupRepository } from "./project/ProjectLookupRepository.supabase";
export { createSprintRepository } from "./sprint/SprintRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
export { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";
export { createRealtimeRepository } from "@/modules/board/infrastructure/supabase/realtime/RealtimeRepository.supabase";
