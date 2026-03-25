import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

/**
 * Check whether a project already contains at least one ticket comment.
 */
export const hasProjectComments = async (
  projectId: string,
  repo: CommentRepository
): Promise<boolean> => {
  return repo.hasByProject(projectId);
};
