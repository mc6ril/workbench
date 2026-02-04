import type { Epic } from "@/core/domain/schema/epic.schema";

import type { EpicRepository } from "@/core/ports/epicRepository";
import type { ProjectRepository } from "@/core/ports/projectRepository";

type GetEpicByCodeInput = {
  projectShortCode: string;
  codeNumber: number;
};

export const getEpicByCode = async (
  projectRepository: ProjectRepository,
  epicRepository: EpicRepository,
  input: GetEpicByCodeInput
): Promise<Epic | null> => {
  const shortCode = input.projectShortCode.trim().toUpperCase();

  const project = await projectRepository.findByShortCode(shortCode);

  if (!project) {
    return null;
  }

  return epicRepository.findByCode(project.id, input.codeNumber);
};
