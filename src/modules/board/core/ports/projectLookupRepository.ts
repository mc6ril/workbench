/**
 * Minimal project lookup contract for the board module.
 * Avoids coupling board's core layer to the workspace domain.
 */
export type ProjectLookupRepository = {
  /**
   * Resolve a project ID from its short code.
   * Used to look up tickets by human-readable code (e.g. "WB-42").
   */
  findIdByShortCode(shortCode: string): Promise<string | null>;

  /**
   * Resolve a project short code from its ID.
   * Used to display human-readable ticket codes in the board UI.
   */
  findShortCodeById(projectId: string): Promise<string | null>;
};
