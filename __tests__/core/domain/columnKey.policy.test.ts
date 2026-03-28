import {
  generateColumnKey,
  normalizeColumnKey,
} from "@/modules/board/core/domain/columnKey.policy";

describe("columnKey policy", () => {
  describe("normalizeColumnKey", () => {
    it("canonicalizes an existing key for comparisons", () => {
      expect(normalizeColumnKey("  In-Progress  ")).toBe("in-progress");
    });
  });

  describe("generateColumnKey", () => {
    it("returns a slugified key from the column name", () => {
      expect(generateColumnKey("In Progress", new Set())).toBe("in-progress");
    });

    it("returns the next available suffixed key when the base key is occupied", () => {
      expect(
        generateColumnKey("Done", new Set(["done", "done-2", "done-3"]))
      ).toBe("done-4");
    });

    it("falls back to the safe default key when name and fallback slugify to empty strings", () => {
      expect(generateColumnKey("!!!", new Set(), "???")).toBe("column");
    });
  });
});
