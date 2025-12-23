import type { TestEntity } from "./entityBuilder";
import { createTestEntity } from "./entityBuilder";

describe("entity builders", () => {
  it("creates a default test entity with sensible values", () => {
    const entity = createTestEntity();

    expect(entity).toMatchObject({
      id: expect.any(String),
      value: expect.any(Number),
    });
  });

  it("allows overriding default fields", () => {
    const entity: TestEntity = createTestEntity({
      id: "custom-id",
      value: 123,
    });

    expect(entity.id).toBe("custom-id");
    expect(entity.value).toBe(123);
  });
});
