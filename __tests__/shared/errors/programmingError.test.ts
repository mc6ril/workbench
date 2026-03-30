import {
  isProgrammingError,
  ProgrammingError,
  throwProgrammingError,
} from "@/shared/errors/programmingError";

describe("programmingError", () => {
  it("throwProgrammingError throws ProgrammingError", () => {
    expect(() => throwProgrammingError("bad usage")).toThrow(ProgrammingError);
    expect(() => throwProgrammingError("bad usage")).toThrow("bad usage");
  });

  it("isProgrammingError narrows ProgrammingError", () => {
    try {
      throwProgrammingError("x");
    } catch (e) {
      expect(isProgrammingError(e)).toBe(true);
    }
  });

  it("isProgrammingError is false for AppError-like objects", () => {
    expect(isProgrammingError({ _tag: "AppError", code: "NOT_FOUND" })).toBe(
      false
    );
  });
});
