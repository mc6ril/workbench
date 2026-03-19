import {
  type Epic,
  type GetEpicByCodeInput,
  GetEpicByCodeInputSchema,
} from "@/modules/board/core/domain/schema/epic.schema";
import type { EpicRepository } from "@/modules/board/core/ports/epicRepository";
import type { ProjectLookupRepository } from "@/modules/board/core/ports/projectLookupRepository";

/**
 * Get an epic by its project short code and code number.
 * Validates input, resolves the project, then fetches the epic.
 *
 * @param projectLookupRepository - Minimal project lookup (short code → id)
 * @param epicRepository - Epic repository
 * @param input - Project short code and epic code number
 * @returns Epic or null if not found
 * @throws ZodError if input validation fails
 * @throws DatabaseError if database operation fails
 */
export const getEpicByCode = async (
  projectLookupRepository: ProjectLookupRepository,
  epicRepository: EpicRepository,
  input: GetEpicByCodeInput
): Promise<Epic | null> => {
  const validatedInput = GetEpicByCodeInputSchema.parse(input);

  const shortCode = validatedInput.projectShortCode.trim().toUpperCase();

  const projectId = await projectLookupRepository.findIdByShortCode(shortCode);

  if (!projectId) {
    return null;
  }

  return epicRepository.findByCode(projectId, validatedInput.codeNumber);
};
