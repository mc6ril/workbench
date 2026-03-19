import { resolveProjectPermissions } from "@/domains/project/presentation/providers/permissions/resolveProjectPermissions";
import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

describe("resolveProjectPermissions", () => {
  it("grants edit capabilities for admin", () => {
    const permissions = resolveProjectPermissions(ProjectRole.ADMIN);

    expect(permissions.isAdmin).toBe(true);
    expect(permissions.isMember).toBe(false);
    expect(permissions.isViewer).toBe(false);
    expect(permissions.canEditProject).toBe(true);
    expect(permissions.canManageMembers).toBe(true);
    expect(permissions.canComment).toBe(true);
    expect(permissions.canMoveTicket).toBe(true);
    expect(permissions.canCreateTicket).toBe(true);
    expect(permissions.canCreateEpic).toBe(true);
  });

  it("grants edit capabilities for member without admin actions", () => {
    const permissions = resolveProjectPermissions(ProjectRole.MEMBER);

    expect(permissions.isAdmin).toBe(false);
    expect(permissions.isMember).toBe(true);
    expect(permissions.isViewer).toBe(false);
    expect(permissions.canEditProject).toBe(true);
    expect(permissions.canManageMembers).toBe(false);
    expect(permissions.canComment).toBe(true);
    expect(permissions.canMoveTicket).toBe(true);
    expect(permissions.canCreateTicket).toBe(true);
    expect(permissions.canCreateEpic).toBe(true);
  });

  it("keeps viewer read-only", () => {
    const permissions = resolveProjectPermissions(ProjectRole.VIEWER);

    expect(permissions.isAdmin).toBe(false);
    expect(permissions.isMember).toBe(false);
    expect(permissions.isViewer).toBe(true);
    expect(permissions.canEditProject).toBe(false);
    expect(permissions.canManageMembers).toBe(false);
    expect(permissions.canComment).toBe(false);
    expect(permissions.canMoveTicket).toBe(false);
    expect(permissions.canCreateTicket).toBe(false);
    expect(permissions.canCreateEpic).toBe(false);
  });

  it("defaults to safe read-only when role is unknown", () => {
    const permissions = resolveProjectPermissions(null);

    expect(permissions.isAdmin).toBe(false);
    expect(permissions.isMember).toBe(false);
    expect(permissions.isViewer).toBe(false);
    expect(permissions.canEditProject).toBe(false);
    expect(permissions.canManageMembers).toBe(false);
    expect(permissions.canComment).toBe(false);
    expect(permissions.canMoveTicket).toBe(false);
    expect(permissions.canCreateTicket).toBe(false);
    expect(permissions.canCreateEpic).toBe(false);
  });
});
