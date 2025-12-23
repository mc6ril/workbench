import type { ExampleRepository } from "@/core/ports/exampleRepository";
import { isHighValue } from "@/core/domain/example/exampleEntity";

/**
 * Usecase that checks if an example entity is considered "high value"
 * according to the domain rule implemented in isHighValue.
 */
export async function checkIfExampleIsHighValue(
  repository: ExampleRepository,
  id: string,
  threshold: number
): Promise<boolean> {
  const entity = await repository.getById(id);

  return isHighValue(entity, threshold);
}
