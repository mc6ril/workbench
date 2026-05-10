import { z } from "zod";

import {
  type ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import type { ProjectInvitationGateway } from "@/domains/project/core/ports/project-invitation.gateway";

export const InviteToProjectInputSchema = z.object({
  projectId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
});

export type InviteToProjectInput = z.infer<typeof InviteToProjectInputSchema>;

export const inviteToProject = async (
  invitationGateway: ProjectInvitationGateway,
  input: InviteToProjectInput
): Promise<ProjectInvitation> => {
  const parsed = InviteToProjectInputSchema.parse(input);
  return invitationGateway.create(parsed);
};
