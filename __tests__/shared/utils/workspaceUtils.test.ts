import { getWorkspaceEmoji } from "@/shared/utils/workspaceUtils";

describe("getWorkspaceEmoji", () => {
  it("should return first emoji for index 0", () => {
    expect(getWorkspaceEmoji(0)).toBe("🎨");
  });

  it("should return different emojis for different indices", () => {
    expect(getWorkspaceEmoji(1)).toBe("🛍️");
    expect(getWorkspaceEmoji(3)).toBe("✨");
  });

  it("should cycle through emojis when index exceeds array length", () => {
    expect(getWorkspaceEmoji(8)).toBe("🎨");
    expect(getWorkspaceEmoji(9)).toBe("🛍️");
  });
});
