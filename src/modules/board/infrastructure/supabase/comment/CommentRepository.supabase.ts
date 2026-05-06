import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import {
  mapCommentWithAuthorRowsToDomain,
  mapCommentWithAuthorRowToDomain,
} from "./CommentMapper.supabase";

import type {
  CommentWithAuthor,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/modules/board/core/domain/comment.types";
import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";
import type { CommentWithAuthorRow } from "@/modules/board/infrastructure/supabase/comment/types";

/**
 * Create a CommentRepository implementation using the provided Supabase client.
 */
export const createCommentRepository = (
  client: SupabaseClient
): CommentRepository => ({
  async hasByProject(projectId: string): Promise<boolean> {
    try {
      const { data, error } = await client
        .from("comments")
        .select("id")
        .eq("project_id", projectId)
        .limit(1);

      if (error) {
        return handleRepositoryError(error, "Comment", projectId);
      }

      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      return handleRepositoryError(error, "Comment", projectId);
    }
  },

  async listByTicket(ticketId: string): Promise<CommentWithAuthor[]> {
    try {
      const { data, error } = await client.rpc("get_ticket_comments", {
        p_ticket_id: ticketId,
      });

      if (error) {
        return handleRepositoryError(error, "Comment");
      }

      return mapCommentWithAuthorRowsToDomain(
        (data ?? []) as CommentWithAuthorRow[]
      );
    } catch (error) {
      return handleRepositoryError(error, "Comment");
    }
  },

  async create(input: CreateCommentInput): Promise<CommentWithAuthor> {
    try {
      const { data: claimsData, error: claimsError } =
        await client.auth.getClaims();

      if (claimsError) {
        return handleRepositoryError(claimsError, "Comment");
      }

      const claims = claimsData?.claims;

      if (!claims) {
        return handleRepositoryError(
          createDatabaseError("User not authenticated"),
          "Comment"
        );
      }
      const authorId = claims?.sub;

      if (!authorId) {
        return handleRepositoryError(
          createDatabaseError("User not authenticated"),
          "Comment"
        );
      }

      const { data, error } = await client
        .from("comments")
        .insert({
          ticket_id: input.ticketId,
          author_id: authorId,
          content: input.content,
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Comment");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Comment"
        );
      }

      // Re-fetch with author profile data via RPC
      const { data: enriched, error: rpcError } = await client.rpc(
        "get_ticket_comments",
        { p_ticket_id: input.ticketId }
      );

      if (rpcError) {
        return handleRepositoryError(rpcError, "Comment");
      }

      const created = (enriched as CommentWithAuthorRow[]).find(
        (c) => c.id === (data as { id: string }).id
      );

      if (!created) {
        return handleRepositoryError(
          createDatabaseError("Created comment not found in RPC result"),
          "Comment"
        );
      }

      return mapCommentWithAuthorRowToDomain(created);
    } catch (error) {
      return handleRepositoryError(error, "Comment");
    }
  },

  async update(
    id: string,
    input: UpdateCommentInput
  ): Promise<CommentWithAuthor> {
    try {
      // author_id FK points to auth.users, not user_profiles — PostgREST cannot embed
      // profiles on select; re-fetch via get_ticket_comments like create().
      const { data, error } = await client
        .from("comments")
        .update({ content: input.content })
        .eq("id", id)
        .select("id, ticket_id")
        .single();

      if (error) {
        return handleRepositoryError(error, "Comment", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Comment", id),
          "Comment",
          id
        );
      }

      const ticketId = (data as { ticket_id: string }).ticket_id;

      const { data: enriched, error: rpcError } = await client.rpc(
        "get_ticket_comments",
        { p_ticket_id: ticketId }
      );

      if (rpcError) {
        return handleRepositoryError(rpcError, "Comment", id);
      }

      const updated = (enriched as CommentWithAuthorRow[]).find(
        (author) => author.id === id
      );

      if (!updated) {
        return handleRepositoryError(
          createDatabaseError("Updated comment not found in RPC result"),
          "Comment",
          id
        );
      }

      return mapCommentWithAuthorRowToDomain(updated);
    } catch (error) {
      return handleRepositoryError(error, "Comment", id);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("comments").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Comment", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Comment", id);
    }
  },
});
