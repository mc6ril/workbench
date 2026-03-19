/**
 * Password strength levels.
 * Used by the UI to display a visual strength indicator.
 */
export enum PasswordStrength {
  NONE = "none",
  WEAK = "weak",
  MEDIUM = "medium",
  STRONG = "strong",
}

/**
 * Criteria breakdown for password strength evaluation.
 * Each boolean indicates whether a specific criterion is met.
 */
export type PasswordStrengthCriteria = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

const MIN_LENGTH_THRESHOLD = 6;
const MEDIUM_LENGTH_THRESHOLD = 10;

/**
 * Evaluate individual password strength criteria.
 * Pure function — no side effects, no external dependencies.
 */
export const evaluatePasswordCriteria = (
  password: string
): PasswordStrengthCriteria => ({
  hasMinLength: password.length >= MIN_LENGTH_THRESHOLD,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[^A-Za-z0-9]/.test(password),
});

/**
 * Ordered list of password criteria keys, checked from top to bottom.
 * The first unmet criterion is the one shown as a hint to the user.
 */
const CRITERIA_ORDER: (keyof PasswordStrengthCriteria)[] = [
  "hasMinLength",
  "hasUppercase",
  "hasLowercase",
  "hasNumber",
  "hasSpecialChar",
];

/**
 * Return the key of the first unmet password criterion, or null if all are met.
 * Used by the UI to display a dynamic helper text guiding the user.
 */
export const getNextUnmetCriterion = (
  password: string
): keyof PasswordStrengthCriteria | null => {
  if (!password) {
    return "hasMinLength";
  }
  const criteria = evaluatePasswordCriteria(password);
  return CRITERIA_ORDER.find((key) => !criteria[key]) ?? null;
};

/**
 * Numeric level associated with each strength value.
 * Useful for UI indicators that need an ordinal representation (e.g. bar segments).
 */
const STRENGTH_LEVEL: Record<PasswordStrength, number> = {
  [PasswordStrength.NONE]: 0,
  [PasswordStrength.WEAK]: 1,
  [PasswordStrength.MEDIUM]: 2,
  [PasswordStrength.STRONG]: 3,
};

export const MAX_STRENGTH_LEVEL = STRENGTH_LEVEL[PasswordStrength.STRONG];

export const getPasswordStrengthLevel = (
  strength: PasswordStrength
): number => STRENGTH_LEVEL[strength];

/**
 * Calculate overall password strength from criteria.
 *
 * Scoring:
 * - NONE: empty password
 * - WEAK: meets fewer than 3 criteria or does not meet minimum length
 * - MEDIUM: meets 3-4 criteria
 * - STRONG: meets all 5 criteria and length >= 10
 */
export const calculatePasswordStrength = (
  password: string
): PasswordStrength => {
  if (!password) {
    return PasswordStrength.NONE;
  }

  const criteria = evaluatePasswordCriteria(password);

  if (!criteria.hasMinLength) {
    return PasswordStrength.WEAK;
  }

  const metCount = Object.values(criteria).filter(Boolean).length;

  if (metCount >= 5 && password.length >= MEDIUM_LENGTH_THRESHOLD) {
    return PasswordStrength.STRONG;
  }

  if (metCount >= 3) {
    return PasswordStrength.MEDIUM;
  }

  return PasswordStrength.WEAK;
};
