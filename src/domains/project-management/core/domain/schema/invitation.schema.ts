import { z } from "zod";

import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

/**
 * Status of a project invitation through its lifecycle.
 */
export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
}

/**
 * Zod schema for ProjectInvitation entity.
 * Represents an invitation sent to a user to join a project.
 */
export const ProjectInvitationSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  email: z.string().email().nullable().optional(),
  role: z.nativeEnum(ProjectRole),
  status: z.nativeEnum(InvitationStatus),
  token: z.string(),
  invitedBy: z.string().uuid(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/** An invitation link to join a project. */
export type ProjectInvitation = z.infer<typeof ProjectInvitationSchema>;

/**
 * Input for creating a new invitation.
 * Only admins can create invitations.
 */
export const CreateInvitationInputSchema = z.object({
  projectId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
});

export type CreateInvitationInput = z.infer<typeof CreateInvitationInputSchema>;

/**
 * A pending invitation enriched with project and inviter info.
 * Returned by get_pending_invitations RPC for display to invited users.
 */
export type PendingInvitation = {
  id: string;
  projectId: string;
  projectName: string;
  role: ProjectRole;
  invitedByName: string;
  expiresAt: Date;
  createdAt: Date;
  token: string;
};
