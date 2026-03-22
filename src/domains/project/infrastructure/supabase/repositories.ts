import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createInvitationRepository } from "./invitation/InvitationRepository.supabase";
import { createMemberRepository } from "./member/MemberRepository.supabase";
import { createProjectRepository } from "./project/ProjectRepository.supabase";

export const invitationRepository = createInvitationRepository(
  createSupabaseBrowserClient()
);

export const memberRepository = createMemberRepository(
  createSupabaseBrowserClient()
);

export const projectRepository = createProjectRepository(
  createSupabaseBrowserClient()
);

export { createInvitationRepository } from "./invitation/InvitationRepository.supabase";
export { createMemberRepository } from "./member/MemberRepository.supabase";
export { createProjectRepository } from "./project/ProjectRepository.supabase";
