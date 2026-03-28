import type { SupabaseClient } from "@supabase/supabase-js";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { mapInvitationRowToDomain } from "./InvitationMapper.supabase";

import type {
  CreateInvitationInput,
  ProjectInvitation,
} from "@/domains/project/core/domain/schema/invitation.schema";
import type { InvitationRepository } from "@/domains/project/core/ports/invitationRepository";
import type { InvitationRow } from "@/domains/project/infrastructure/supabase/types";

/**
 * Create an InvitationRepository implementation using the provided Supabase client.
 *
 * @param client - Supabase client instance to use
 * @returns InvitationRepository implementation
 */
export const createInvitationRepository = (
  client: SupabaseClient
): InvitationRepository => ({
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

  async create(input: CreateInvitationInput): Promise<ProjectInvitation> {
    const { data, error } = await client
      .from("project_invitations")
      .insert({
        project_id: input.projectId,
        role: input.role,
        invited_by: (await client.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }

    return mapInvitationRowToDomain(data as InvitationRow);
  },

  async accept(
    token: string
  ): Promise<{ projectId: string; projectName: string; role: string }> {
    const { data, error } = await client.rpc("accept_invitation", {
      invitation_token: token,
    });

    if (error) {
      return handleRepositoryError(error, "ProjectInvitation");
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      projectId: row.project_id,
      projectName: row.project_name,
      role: row.role,
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
