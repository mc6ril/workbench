import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createInvitationRepository } from "./invitation/InvitationRepository.supabase";
import { createMemberRepository } from "./member/MemberRepository.supabase";

export const invitationRepository = createInvitationRepository(
  createSupabaseBrowserClient()
);

export const memberRepository = createMemberRepository(
  createSupabaseBrowserClient()
);

export { createInvitationRepository } from "./invitation/InvitationRepository.supabase";
export { createMemberRepository } from "./member/MemberRepository.supabase";
