import type { Project } from "@/core/domain/project/project.schema";
import {
  type CreateProjectInput,
  CreateProjectInputSchema,
} from "@/core/domain/project/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * Create a new project.
 * Validates input and creates a new project.
 * Note: RLS policies ensure users can only create projects if they have no existing project access.
 * The creator is automatically added as admin via database trigger.
 *
 * @param repository - Project repository
 * @param input - Project creation data (name)
 * @returns Created project
 * @throws ConstraintError if constraint violation occurs (e.g., user already has project access)
 * @throws DatabaseError if database operation fails
 */
export async function createProject(
  repository: ProjectRepository,
  input: CreateProjectInput
): Promise<Project> {
  // Validate input with Zod schema
  const validatedInput = CreateProjectInputSchema.parse(input);

  // Call repository to create project
  return repository.create(validatedInput);
}

