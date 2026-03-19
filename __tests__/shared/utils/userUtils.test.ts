import { getInitials } from "@/domains/auth/utils/userUtils";

describe("getInitials", () => {
  it("should return two initials from a two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should return two initials from a multi-word name", () => {
    expect(getInitials("Jean Pierre Martin")).toBe("JP");
  });

  it("should return first two characters from a single word", () => {
    expect(getInitials("Alice")).toBe("AL");
  });

  it("should return single character when name is one character", () => {
    expect(getInitials("A")).toBe("A");
  });

  it("should return ? for null input", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("should return ? for undefined input", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("should return ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("should return ? for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("should derive initials from email address", () => {
    expect(getInitials("john.doe@example.com")).toBe("JD");
  });

  it("should derive initials from email with underscore", () => {
    expect(getInitials("j_doe@example.com")).toBe("JD");
  });

  it("should derive two characters from single-part email", () => {
    expect(getInitials("john@example.com")).toBe("JO");
  });
});
