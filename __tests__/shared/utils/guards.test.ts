import {
  hasErrorCode,
  isErrorWithCode,
  isNonEmptyArray,
  isNonEmptyString,
  isObject,
  isString,
} from "@/shared/utils/guards";

describe("guards", () => {
  describe("isObject", () => {
    it("should return true for plain objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
      expect(isObject({ a: 1, b: 2 })).toBe(true);
    });

    it("should return false for null", () => {
      expect(isObject(null)).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isObject([])).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });

    it("should return false for primitives", () => {
      expect(isObject(undefined)).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(Symbol("test"))).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = { key: "value" };
      if (isObject(value)) {
        // TypeScript should recognize value as Record<string, unknown>
        expect(value.key).toBe("value");
      }
    });
  });

  describe("isString", () => {
    it("should return true for strings", () => {
      expect(isString("")).toBe(true);
      expect(isString("hello")).toBe(true);
      expect(isString("   ")).toBe(true);
    });

    it("should return false for non-strings", () => {
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = "test";
      if (isString(value)) {
        // TypeScript should recognize value as string
        expect(value.length).toBe(4);
      }
    });
  });

  describe("isNonEmptyString", () => {
    it("should return true for non-empty strings", () => {
      expect(isNonEmptyString("hello")).toBe(true);
      expect(isNonEmptyString("a")).toBe(true);
      expect(isNonEmptyString("   content   ")).toBe(true);
    });

    it("should return false for empty strings", () => {
      expect(isNonEmptyString("")).toBe(false);
    });

    it("should return false for whitespace-only strings", () => {
      expect(isNonEmptyString("   ")).toBe(false);
      expect(isNonEmptyString("\t")).toBe(false);
      expect(isNonEmptyString("\n")).toBe(false);
      expect(isNonEmptyString("\r\n")).toBe(false);
    });

    it("should return false for non-strings", () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString(true)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = "test";
      if (isNonEmptyString(value)) {
        // TypeScript should recognize value as string
        expect(value.trim()).toBe("test");
      }
    });
  });

  describe("isErrorWithCode", () => {
    it("should return true for objects with code property", () => {
      expect(isErrorWithCode({ code: "ERROR" })).toBe(true);
      expect(isErrorWithCode({ code: "NOT_FOUND", message: "test" })).toBe(
        true
      );
    });

    it("should return false for objects without code property", () => {
      expect(isErrorWithCode({ message: "test" })).toBe(false);
      expect(isErrorWithCode({})).toBe(false);
    });

    it("should return false for objects with non-string code", () => {
      expect(isErrorWithCode({ code: 123 })).toBe(false);
      expect(isErrorWithCode({ code: null })).toBe(false);
      expect(isErrorWithCode({ code: undefined })).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(isErrorWithCode(null)).toBe(false);
      expect(isErrorWithCode(undefined)).toBe(false);
      expect(isErrorWithCode("string")).toBe(false);
      expect(isErrorWithCode(123)).toBe(false);
      expect(isErrorWithCode([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const error: unknown = { code: "NOT_FOUND", message: "test" };
      if (isErrorWithCode(error)) {
        // TypeScript should recognize error.code as string
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("hasErrorCode", () => {
    it("should return true when error has one of the specified codes", () => {
      expect(hasErrorCode({ code: "NOT_FOUND" }, ["NOT_FOUND"])).toBe(true);
      expect(
        hasErrorCode(
          { code: "DATABASE_ERROR" },
          ["NOT_FOUND", "DATABASE_ERROR", "CONSTRAINT_VIOLATION"]
        )
      ).toBe(true);
    });

    it("should return false when error has different code", () => {
      expect(hasErrorCode({ code: "NOT_FOUND" }, ["DATABASE_ERROR"])).toBe(
        false
      );
      expect(
        hasErrorCode(
          { code: "CUSTOM_ERROR" },
          ["NOT_FOUND", "DATABASE_ERROR"]
        )
      ).toBe(false);
    });

    it("should return false when error has no code property", () => {
      expect(hasErrorCode({ message: "test" }, ["NOT_FOUND"])).toBe(false);
      expect(hasErrorCode({}, ["NOT_FOUND"])).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(hasErrorCode(null, ["NOT_FOUND"])).toBe(false);
      expect(hasErrorCode(undefined, ["NOT_FOUND"])).toBe(false);
      expect(hasErrorCode("string", ["NOT_FOUND"])).toBe(false);
    });

    it("should return false for empty codes array", () => {
      expect(hasErrorCode({ code: "NOT_FOUND" }, [])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const error: unknown = { code: "NOT_FOUND", message: "test" };
      if (hasErrorCode(error, ["NOT_FOUND", "DATABASE_ERROR"])) {
        // TypeScript should recognize error.code as string
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("isNonEmptyArray", () => {
    it("should return true for non-empty arrays", () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(["a", "b"])).toBe(true);
      expect(isNonEmptyArray([{}])).toBe(true);
    });

    it("should return false for empty arrays", () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    it("should return false for non-arrays", () => {
      expect(isNonEmptyArray(null)).toBe(false);
      expect(isNonEmptyArray(undefined)).toBe(false);
      expect(isNonEmptyArray("string")).toBe(false);
      expect(isNonEmptyArray(123)).toBe(false);
      expect(isNonEmptyArray({})).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = [1, 2, 3];
      if (isNonEmptyArray<number>(value)) {
        // TypeScript should recognize value as number[]
        expect(value[0]).toBe(1);
        expect(value.length).toBeGreaterThan(0);
      }
    });

    it("should work with typed arrays", () => {
      const numbers: unknown = [1, 2, 3];
      if (isNonEmptyArray<number>(numbers)) {
        expect(numbers).toEqual([1, 2, 3]);
      }

      const strings: unknown = ["a", "b", "c"];
      if (isNonEmptyArray<string>(strings)) {
        expect(strings).toEqual(["a", "b", "c"]);
      }
    });
  });
});

