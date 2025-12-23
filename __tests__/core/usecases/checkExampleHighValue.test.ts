import type { ExampleRepository } from "@/core/ports/exampleRepository";
import { checkIfExampleIsHighValue } from "@/core/usecases/checkExampleHighValue";

describe("checkIfExampleIsHighValue", () => {
  it("calls repository with the provided id and returns high value status", async () => {
    const repository: ExampleRepository = {
      getById: jest.fn().mockResolvedValue({ id: "entity-1", value: 20 }),
    };

    const result = await checkIfExampleIsHighValue(repository, "entity-1", 10);

    expect(repository.getById).toHaveBeenCalledWith("entity-1");
    expect(result).toBe(true);
  });

  it("returns false when domain rule considers value not high", async () => {
    const repository: ExampleRepository = {
      getById: jest.fn().mockResolvedValue({ id: "entity-2", value: 5 }),
    };

    const result = await checkIfExampleIsHighValue(repository, "entity-2", 10);

    expect(result).toBe(false);
  });
});
