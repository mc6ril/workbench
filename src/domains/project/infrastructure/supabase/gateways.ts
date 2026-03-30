import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createProjectInvitationGateway } from "./invitation/ProjectInvitationGateway.supabase";
import { createProjectMemberGateway } from "./member/ProjectMemberGateway.supabase";
import { createProjectGateway } from "./project/ProjectGateway.supabase";

export const projectInvitationGateway = createProjectInvitationGateway(
  createSupabaseBrowserClient()
);

export const projectMemberGateway =
  createProjectMemberGateway(createSupabaseBrowserClient());

export const projectGateway = createProjectGateway(createSupabaseBrowserClient());

export { createProjectInvitationGateway } from "./invitation/ProjectInvitationGateway.supabase";
export { createProjectMemberGateway } from "./member/ProjectMemberGateway.supabase";
export { createProjectGateway } from "./project/ProjectGateway.supabase";
