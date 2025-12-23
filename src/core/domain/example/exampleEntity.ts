/**
 * ExampleEntity represents a simple domain entity used only
 * to validate the Jest testing setup and Clean Architecture flow.
 */
export type ExampleEntity = {
  id: string;
  value: number;
};

/**
 * Returns true when the entity value is strictly greater than the threshold.
 * Throws when the provided threshold is not a positive number.
 */
export function isHighValue(entity: ExampleEntity, threshold: number): boolean {
  if (threshold <= 0) {
    throw new Error("threshold must be a positive number");
  }

  return entity.value > threshold;
}
