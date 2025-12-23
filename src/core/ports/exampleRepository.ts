import type { ExampleEntity } from "@/core/domain/example/exampleEntity";

/**
 * ExampleRepository defines the minimal contract required by the
 * example usecase used to validate Jest configuration.
 */
export type ExampleRepository = {
  getById(id: string): Promise<ExampleEntity>;
};
