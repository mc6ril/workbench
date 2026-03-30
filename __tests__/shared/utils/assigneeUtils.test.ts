import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { resolveAssigneeIdentity } from "@/modules/board/utils/assigneeUtils";

describe("resolveAssigneeIdentity", () => {
  it("falls back to the matching project member profile when assignee data is incomplete", () => {
    const result = resolveAssigneeIdentity(
      {
        userId: "user-1",
        displayName: null,
        avatarUrl: null,
        assignedAt: new Date("2026-03-20T10:00:00.000Z"),
      },
      [
        {
          id: "member-1",
          projectId: "project-1",
          userId: "user-1",
          role: ProjectRole.MEMBER,
          profile: {
            id: "user-1",
            email: "user@example.com",
            displayName: "User Test",
            avatarUrl: "https://example.com/avatar.webp",
            preferences: { ...DEFAULT_USER_PREFERENCES },
            termsAcceptedAt: null,
            createdAt: new Date("2026-03-20T10:00:00.000Z"),
            updatedAt: new Date("2026-03-20T10:00:00.000Z"),
          },
          createdAt: new Date("2026-03-20T10:00:00.000Z"),
          updatedAt: new Date("2026-03-20T10:00:00.000Z"),
        },
      ]
    );

    expect(result).toEqual({
      displayName: "User Test",
      avatarUrl: "https://example.com/avatar.webp",
    });
  });
});
