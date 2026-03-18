import {
  calculatePasswordStrength,
  evaluatePasswordCriteria,
  getNextUnmetCriterion,
  PasswordStrength,
} from "@/domains/project-management/core/domain/passwordStrength";

describe("evaluatePasswordCriteria", () => {
  it("should return all false for empty string", () => {
    const criteria = evaluatePasswordCriteria("");

    expect(criteria.hasMinLength).toBe(false);
    expect(criteria.hasUppercase).toBe(false);
    expect(criteria.hasLowercase).toBe(false);
    expect(criteria.hasNumber).toBe(false);
    expect(criteria.hasSpecialChar).toBe(false);
  });

  it("should detect minimum length", () => {
    expect(evaluatePasswordCriteria("abcdef").hasMinLength).toBe(true);
    expect(evaluatePasswordCriteria("abcde").hasMinLength).toBe(false);
  });

  it("should detect uppercase letters", () => {
    expect(evaluatePasswordCriteria("Hello").hasUppercase).toBe(true);
    expect(evaluatePasswordCriteria("hello").hasUppercase).toBe(false);
  });

  it("should detect lowercase letters", () => {
    expect(evaluatePasswordCriteria("hello").hasLowercase).toBe(true);
    expect(evaluatePasswordCriteria("HELLO").hasLowercase).toBe(false);
  });

  it("should detect numbers", () => {
    expect(evaluatePasswordCriteria("abc123").hasNumber).toBe(true);
    expect(evaluatePasswordCriteria("abcdef").hasNumber).toBe(false);
  });

  it("should detect special characters", () => {
    expect(evaluatePasswordCriteria("abc!@#").hasSpecialChar).toBe(true);
    expect(evaluatePasswordCriteria("abc123").hasSpecialChar).toBe(false);
  });
});

describe("calculatePasswordStrength", () => {
  it("should return NONE for empty password", () => {
    expect(calculatePasswordStrength("")).toBe(PasswordStrength.NONE);
  });

  it("should return WEAK for short passwords", () => {
    expect(calculatePasswordStrength("abc")).toBe(PasswordStrength.WEAK);
    expect(calculatePasswordStrength("12345")).toBe(PasswordStrength.WEAK);
  });

  it("should return WEAK for passwords meeting fewer than 3 criteria", () => {
    expect(calculatePasswordStrength("abcdefgh")).toBe(PasswordStrength.WEAK);
  });

  it("should return MEDIUM for passwords meeting 3-4 criteria", () => {
    expect(calculatePasswordStrength("Abcdef1")).toBe(PasswordStrength.MEDIUM);
    expect(calculatePasswordStrength("Abcdef12")).toBe(PasswordStrength.MEDIUM);
  });

  it("should return STRONG for passwords meeting all 5 criteria with length >= 10", () => {
    expect(calculatePasswordStrength("Abcdef12!@")).toBe(
      PasswordStrength.STRONG
    );
    expect(calculatePasswordStrength("MyP@ssw0rd!")).toBe(
      PasswordStrength.STRONG
    );
  });

  it("should return MEDIUM when all criteria met but length < 10", () => {
    expect(calculatePasswordStrength("Ab1!ef")).toBe(PasswordStrength.MEDIUM);
  });
});

describe("getNextUnmetCriterion", () => {
  it("should return hasMinLength for empty password", () => {
    expect(getNextUnmetCriterion("")).toBe("hasMinLength");
  });

  it("should return hasMinLength for short password", () => {
    expect(getNextUnmetCriterion("Ab1!")).toBe("hasMinLength");
  });

  it("should return hasUppercase when length met but no uppercase", () => {
    expect(getNextUnmetCriterion("abcdef")).toBe("hasUppercase");
  });

  it("should return hasNumber when length, upper, lower met but no number", () => {
    expect(getNextUnmetCriterion("Abcdef")).toBe("hasNumber");
  });

  it("should return hasSpecialChar when only special char is missing", () => {
    expect(getNextUnmetCriterion("Abcdef1")).toBe("hasSpecialChar");
  });

  it("should return null when all criteria are met", () => {
    expect(getNextUnmetCriterion("Abcdef1!")).toBeNull();
  });
});
