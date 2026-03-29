import { containsEmoji } from "@/domains/project/core/domain/rules/projectName.rules";

describe("containsEmoji", () => {
  it("returns false for plain ASCII names", () => {
    expect(containsEmoji("My project")).toBe(false);
  });

  it("returns true when an emoji is present", () => {
    expect(containsEmoji("Projet 📋")).toBe(true);
  });
});
