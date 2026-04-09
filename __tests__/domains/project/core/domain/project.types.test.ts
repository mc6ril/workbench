import {
  getProjectRoleLabelKey,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";

describe("project role label keys", () => {
  it("maps each project role to the expected translation key", () => {
    expect(getProjectRoleLabelKey(ProjectRole.ADMIN)).toBe("roleAdmin");
    expect(getProjectRoleLabelKey(ProjectRole.MEMBER)).toBe("roleMember");
    expect(getProjectRoleLabelKey(ProjectRole.VIEWER)).toBe("roleViewer");
  });
});
