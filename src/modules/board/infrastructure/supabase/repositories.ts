/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createBoardRepository } from "./board/BoardRepository.supabase";
import { createProjectLookupRepository } from "./project/ProjectLookupRepository.supabase";
import { createTicketRepository } from "./ticket/TicketRepository.supabase";
import { createTicketAttachmentRepository } from "./ticketAttachment/TicketAttachmentRepository.supabase";
import { createTicketAttachmentStorage } from "./ticketAttachment/TicketAttachmentStorage.supabase";

import { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";
import { createRealtimeRepository } from "@/modules/board/infrastructure/supabase/realtime/RealtimeRepository.supabase";

export const ticketRepository = createTicketRepository(
  createSupabaseBrowserClient()
);
export const boardRepository = createBoardRepository(
  createSupabaseBrowserClient()
);
export const commentRepository = createCommentRepository(
  createSupabaseBrowserClient()
);
export const ticketAttachmentRepository = createTicketAttachmentRepository(
  createSupabaseBrowserClient()
);
export const ticketAttachmentStorage = createTicketAttachmentStorage(
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
export { createProjectLookupRepository } from "./project/ProjectLookupRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
export { createCommentRepository } from "@/modules/board/infrastructure/supabase/comment/CommentRepository.supabase";
export { createRealtimeRepository } from "@/modules/board/infrastructure/supabase/realtime/RealtimeRepository.supabase";
