import {
  type Epic,
  type GetEpicByCodeInput,
  GetEpicByCodeInputSchema,
} from "@/domains/project-management/core/domain/schema/epic.schema";

import type { EpicRepository } from "@/domains/project-management/core/ports/epicRepository";
import type { ProjectRepository } from "@/domains/workspace/core/ports/projectRepository";

/**
 * Get an epic by its project short code and code number.
 * Validates input, resolves the project, then fetches the epic.
 *
 * @param projectRepository - Project repository
 * @param epicRepository - Epic repository
 * @param input - Project short code and epic code number
 * @returns Epic or null if not found
 * @throws ZodError if input validation fails
 * @throws DatabaseError if database operation fails
 */
export const getEpicByCode = async (
  projectRepository: ProjectRepository,
  epicRepository: EpicRepository,
  input: GetEpicByCodeInput
): Promise<Epic | null> => {
  const validatedInput = GetEpicByCodeInputSchema.parse(input);

  const shortCode = validatedInput.projectShortCode.trim().toUpperCase();

  const project = await projectRepository.findByShortCode(shortCode);

  if (!project) {
    return null;
  }

  return epicRepository.findByCode(project.id, validatedInput.codeNumber);
};
