import { isHighValue } from "@/core/domain/example/exampleEntity";

describe("isHighValue", () => {
  it("returns true when value is strictly greater than threshold", () => {
    const result = isHighValue({ id: "1", value: 15 }, 10);

    expect(result).toBe(true);
  });

  it("returns false when value is equal to threshold", () => {
    const result = isHighValue({ id: "1", value: 10 }, 10);

    expect(result).toBe(false);
  });

  it("throws when threshold is not positive", () => {
    expect(() => isHighValue({ id: "1", value: 10 }, 0)).toThrow(
      "threshold must be a positive number"
    );
  });
});
