import type { SupabaseClient } from "@supabase/supabase-js";

import { createDatabaseError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { mapInvitationRowToDomain } from "./InvitationMapper.supabase";

import type {
  ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import { isProjectRole } from "@/domains/project/core/domain/project.types";
import type {
  AcceptedProjectInvitation,
  ProjectInvitationGateway,
} from "@/domains/project/core/ports/project-invitation.gateway";
import type { InvitationRow } from "@/domains/project/infrastructure/supabase/types";

/**
 * Create a ProjectInvitationGateway implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns ProjectInvitationGateway implementation
 */
export const createProjectInvitationGateway = (
  client: SupabaseClient
): ProjectInvitationGateway => ({
  async listByProject(projectId: string): Promise<ProjectInvitation[]> {
    const { data, error } = await client
      .from("project_invitations")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }

    return ((data ?? []) as InvitationRow[]).map(mapInvitationRowToDomain);
  },

  async create(input: {
    projectId: string;
    role: ProjectRole;
  }): Promise<ProjectInvitation> {
    const { data: claimsData } = await client.auth.getClaims();

    const claims = claimsData?.claims;

    if (!claims) {
      return handleRepositoryError(
        createDatabaseError("User not authenticated"),
        "ProjectInvitation"
      );
    }

    const { data, error } = await client
      .from("project_invitations")
      .insert({
        project_id: input.projectId,
        role: input.role,
        invited_by: claims.sub,
      })
      .select()
      .single();

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }

    return mapInvitationRowToDomain(data as InvitationRow);
  },

  async accept(token: string): Promise<AcceptedProjectInvitation> {
    const { data, error } = await client.rpc("accept_invitation", {
      invitation_token: token,
    });

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row !== "object") {
      return handleRepositoryError(
        createDatabaseError("Invalid invitation acceptance payload"),
        "ProjectInvitation"
      );
    }

    const role = (row as { role?: string }).role;
    if (!role || !isProjectRole(role)) {
      return handleRepositoryError(
        createDatabaseError(`Invalid project role: ${String(role)}`),
        "ProjectInvitation"
      );
    }

    return {
      projectId: (row as { project_id: string }).project_id,
      projectName: (row as { project_name: string }).project_name,
      role,
    };
  },

  async decline(token: string): Promise<void> {
    const { error } = await client.rpc("decline_invitation", {
      invitation_token: token,
    });

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }
  },

  async revoke(invitationId: string): Promise<void> {
    const { error } = await client
      .from("project_invitations")
      .delete()
      .eq("id", invitationId);

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation", invitationId);
    }
  },

  async countPending(projectId: string): Promise<number> {
    const { data, error } = await client
      .from("project_invitations")
      .select("id")
      .eq("project_id", projectId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString());

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }

    return data?.length ?? 0;
  },
});
