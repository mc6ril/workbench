import {
  hasErrorCode,
  isArray,
  isDefined,
  isErrorWithCode,
  isNonEmptyArray,
  isNonEmptyString,
  isNotNull,
  isNotUndefined,
  isNumber,
  isObject,
  isProjectRole,
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
        hasErrorCode({ code: "DATABASE_ERROR" }, [
          "NOT_FOUND",
          "DATABASE_ERROR",
          "CONSTRAINT_VIOLATION",
        ])
      ).toBe(true);
    });

    it("should return false when error has different code", () => {
      expect(hasErrorCode({ code: "NOT_FOUND" }, ["DATABASE_ERROR"])).toBe(
        false
      );
      expect(
        hasErrorCode({ code: "CUSTOM_ERROR" }, ["NOT_FOUND", "DATABASE_ERROR"])
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

  describe("isNumber", () => {
    it("should return true for numbers", () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(-456)).toBe(true);
      expect(isNumber(0.5)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
      expect(isNumber(-Infinity)).toBe(true);
      expect(isNumber(NaN)).toBe(true);
    });

    it("should return false for non-numbers", () => {
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber("123")).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = 42;
      if (isNumber(value)) {
        // TypeScript should recognize value as number
        expect(value.toFixed(2)).toBe("42.00");
      }
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(["a", "b"])).toBe(true);
      expect(isArray([{}])).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
      expect(isArray("string")).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray({})).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = [1, 2, 3];
      if (isArray<number>(value)) {
        // TypeScript should recognize value as number[]
        expect(value[0]).toBe(1);
        expect(value.length).toBe(3);
      }
    });

    it("should work with typed arrays", () => {
      const numbers: unknown = [1, 2, 3];
      if (isArray<number>(numbers)) {
        expect(numbers).toEqual([1, 2, 3]);
      }

      const strings: unknown = ["a", "b", "c"];
      if (isArray<string>(strings)) {
        expect(strings).toEqual(["a", "b", "c"]);
      }
    });

    it("should return true for empty arrays", () => {
      expect(isArray<number>([])).toBe(true);
      expect(isArray<string>([])).toBe(true);
    });
  });

  describe("isDefined", () => {
    it("should return true for defined values", () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined("")).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it("should return false for undefined", () => {
      expect(isDefined(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isDefined(null)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: string | undefined | null = "test";
      if (isDefined(value)) {
        // TypeScript should recognize value as string
        expect(value.length).toBe(4);
      }

      const value2: number | undefined | null = 42;
      if (isDefined(value2)) {
        // TypeScript should recognize value2 as number
        expect(value2.toFixed(2)).toBe("42.00");
      }
    });

    it("should handle falsy but defined values", () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined("")).toBe(true);
      expect(isDefined(false)).toBe(true);
    });
  });

  describe("isNotNull", () => {
    it("should return true for non-null values", () => {
      expect(isNotNull(0)).toBe(true);
      expect(isNotNull("")).toBe(true);
      expect(isNotNull(false)).toBe(true);
      expect(isNotNull(undefined)).toBe(true);
      expect(isNotNull({})).toBe(true);
      expect(isNotNull([])).toBe(true);
    });

    it("should return false for null", () => {
      expect(isNotNull(null)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: string | null = "test";
      if (isNotNull(value)) {
        // TypeScript should recognize value as string
        expect(value.length).toBe(4);
      }

      const value2: number | null = 42;
      if (isNotNull(value2)) {
        // TypeScript should recognize value2 as number
        expect(value2.toFixed(2)).toBe("42.00");
      }
    });

    it("should allow undefined values", () => {
      const value: string | null | undefined = undefined;
      if (isNotNull(value)) {
        // TypeScript should recognize value as string | undefined
        expect(value).toBeUndefined();
      }
    });
  });

  describe("isNotUndefined", () => {
    it("should return true for non-undefined values", () => {
      expect(isNotUndefined(0)).toBe(true);
      expect(isNotUndefined("")).toBe(true);
      expect(isNotUndefined(false)).toBe(true);
      expect(isNotUndefined(null)).toBe(true);
      expect(isNotUndefined({})).toBe(true);
      expect(isNotUndefined([])).toBe(true);
    });

    it("should return false for undefined", () => {
      expect(isNotUndefined(undefined)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: string | undefined = "test";
      if (isNotUndefined(value)) {
        // TypeScript should recognize value as string
        expect(value.length).toBe(4);
      }

      const value2: number | undefined = 42;
      if (isNotUndefined(value2)) {
        // TypeScript should recognize value2 as number
        expect(value2.toFixed(2)).toBe("42.00");
      }
    });

    it("should allow null values", () => {
      const value: string | undefined | null = null;
      if (isNotUndefined(value)) {
        // TypeScript should recognize value as string | null
        expect(value).toBeNull();
      }
    });
  });

  describe("isProjectRole", () => {
    it("should return true for valid project roles", () => {
      expect(isProjectRole("admin")).toBe(true);
      expect(isProjectRole("member")).toBe(true);
      expect(isProjectRole("viewer")).toBe(true);
    });

    it("should return false for invalid project roles", () => {
      expect(isProjectRole("invalid")).toBe(false);
      expect(isProjectRole("ADMIN")).toBe(false);
      expect(isProjectRole("Admin")).toBe(false);
      expect(isProjectRole("")).toBe(false);
      expect(isProjectRole("guest")).toBe(false);
    });

    it("should narrow type correctly", () => {
      const role: string = "admin";
      if (isProjectRole(role)) {
        // TypeScript should recognize role as ProjectRole
        expect(role).toBe("admin");
      }
    });

    it("should handle case sensitivity", () => {
      expect(isProjectRole("admin")).toBe(true);
      expect(isProjectRole("ADMIN")).toBe(false);
      expect(isProjectRole("Admin")).toBe(false);
    });
  });
});
