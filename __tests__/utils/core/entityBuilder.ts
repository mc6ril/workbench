export type TestEntity = {
  id: string;
  value: number;
};

/**
 * Creates a simple test entity with overridable fields.
 * This is a placeholder builder that can be adapted once real domain entities exist.
 */
export const createTestEntity = (
  overrides: Partial<TestEntity> = {}
): TestEntity => {
  return {
    id: overrides.id ?? "test-entity-id",
    value: overrides.value ?? 42,
  };
};
