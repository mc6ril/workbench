import type { ProjectLookupRepository } from "@/modules/board/core/ports/projectLookupRepository";

/**
 * Resolve the short code of a project by its ID.
 * Used by the board UI to display human-readable ticket codes (e.g. "WB-42").
 *
 * @param projectLookupRepository - Minimal project lookup
 * @param projectId - Project ID
 * @returns Short code string or null if not found
 */
export const getProjectShortCode = async (
  projectLookupRepository: ProjectLookupRepository,
  projectId: string
): Promise<string | null> => {
  return projectLookupRepository.findShortCodeById(projectId);
};
