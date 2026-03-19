/**
 * Centralized repository wiring for Supabase implementations.
 * Provides browser instances for React Query hooks and factory functions for server contexts.
 */

import { createCommentRepository } from "@/infrastructure/supabase/comment/CommentRepository.supabase";
import { createInvitationRepository } from "@/infrastructure/supabase/invitation/InvitationRepository.supabase";
import { createRealtimeRepository } from "@/infrastructure/supabase/realtime/RealtimeRepository.supabase";
import { createUserProfileRepository } from "@/infrastructure/supabase/userProfile/UserProfileRepository.supabase";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createBoardRepository } from "./board/BoardRepository.supabase";
import { createEpicRepository } from "./epic/EpicRepository.supabase";
import { createLabelRepository } from "./label/LabelRepository.supabase";
import { createMemberRepository } from "./member/MemberRepository.supabase";
import { createProjectRepository } from "./project/ProjectRepository.supabase";
import { createSprintRepository } from "./sprint/SprintRepository.supabase";
import { createTicketRepository } from "./ticket/TicketRepository.supabase";

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
export const commentRepository = createCommentRepository(
  createSupabaseBrowserClient()
);
export const sprintRepository = createSprintRepository(
  createSupabaseBrowserClient()
);

export const invitationRepository = createInvitationRepository(
  createSupabaseBrowserClient()
);
export const labelRepository = createLabelRepository(
  createSupabaseBrowserClient()
);
export const memberRepository = createMemberRepository(
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
export { createMemberRepository } from "./member/MemberRepository.supabase";
export { createProjectRepository } from "./project/ProjectRepository.supabase";
export { createSprintRepository } from "./sprint/SprintRepository.supabase";
export { createTicketRepository } from "./ticket/TicketRepository.supabase";
export { createCommentRepository } from "@/infrastructure/supabase/comment/CommentRepository.supabase";
export { createInvitationRepository } from "@/infrastructure/supabase/invitation/InvitationRepository.supabase";
export { createRealtimeRepository } from "@/infrastructure/supabase/realtime/RealtimeRepository.supabase";
export { createUserProfileRepository } from "@/infrastructure/supabase/userProfile/UserProfileRepository.supabase";
