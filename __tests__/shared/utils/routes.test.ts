import {
  buildProjectRoute,
  buildTicketDetailRoute,
  extractProjectId,
  extractProjectView,
  isActiveHref,
  isProjectRoute,
  isProtectedRoute,
  isPublicRoute,
  normalizePath,
} from "@/shared/utils/routes";

describe("isPublicRoute", () => {
  it("should return true for known public routes", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/auth/signin")).toBe(true);
    expect(isPublicRoute("/auth/signup")).toBe(true);
    expect(isPublicRoute("/auth/verify-email")).toBe(true);
    expect(isPublicRoute("/auth/reset-password")).toBe(true);
    expect(isPublicRoute("/auth/update-password")).toBe(true);
    expect(isPublicRoute("/auth/callback")).toBe(true);
    expect(isPublicRoute("/legal")).toBe(true);
    expect(isPublicRoute("/pricing")).toBe(true);
  });

  it("should return false for non-public routes", () => {
    expect(isPublicRoute("/workspace")).toBe(false);
    expect(isPublicRoute("/account")).toBe(false);
    expect(isPublicRoute("/unknown")).toBe(false);
  });
});

describe("isProtectedRoute", () => {
  it("should return true for exact protected routes", () => {
    expect(isProtectedRoute("/workspace")).toBe(true);
    expect(isProtectedRoute("/account")).toBe(true);
  });

  it("should return true for project routes", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    expect(isProtectedRoute(`/${uuid}`)).toBe(true);
    expect(isProtectedRoute(`/${uuid}/board`)).toBe(true);
    expect(isProtectedRoute(`/${uuid}/settings`)).toBe(true);
  });

  it("should return false for public routes", () => {
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/auth/signin")).toBe(false);
  });

  it("should return false for non-matching routes", () => {
    expect(isProtectedRoute("/random")).toBe(false);
    expect(isProtectedRoute("/not-a-uuid/board")).toBe(false);
  });
});

describe("isProjectRoute", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("should return true for valid project routes", () => {
    expect(isProjectRoute(`/${uuid}/board`)).toBe(true);
    expect(isProjectRoute(`/${uuid}/settings`)).toBe(true);
  });

  it("should return true for nested project routes", () => {
    expect(isProjectRoute(`/${uuid}/board/detail`)).toBe(true);
  });

  it("should return true for project root route", () => {
    expect(isProjectRoute(`/${uuid}`)).toBe(true);
  });

  it("should return false for non-project routes", () => {
    expect(isProjectRoute("/workspace")).toBe(false);
    expect(isProjectRoute("/not-uuid/board")).toBe(false);
  });
});

describe("extractProjectId", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("should extract project ID from project route", () => {
    expect(extractProjectId(`/${uuid}/board`)).toBe(uuid);
    expect(extractProjectId(`/${uuid}/settings`)).toBe(uuid);
  });

  it("should extract project ID from root project path", () => {
    expect(extractProjectId(`/${uuid}`)).toBe(uuid);
  });

  it("should return null for non-project routes", () => {
    expect(extractProjectId("/workspace")).toBeNull();
    expect(extractProjectId("/auth/signin")).toBeNull();
    expect(extractProjectId("/")).toBeNull();
  });
});

describe("extractProjectView", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("should extract view name from project route", () => {
    expect(extractProjectView(`/${uuid}/board`)).toBe("board");
    expect(extractProjectView(`/${uuid}/settings`)).toBe("settings");
  });

  it("should return null when no view present", () => {
    expect(extractProjectView(`/${uuid}`)).toBeNull();
  });

  it("should return null for non-project routes", () => {
    expect(extractProjectView("/workspace")).toBeNull();
    expect(extractProjectView("/")).toBeNull();
  });
});

describe("buildProjectRoute", () => {
  it("should build a project route from ID and view", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    expect(buildProjectRoute(uuid, "board")).toBe(`/${uuid}/board`);
    expect(buildProjectRoute(uuid, "settings")).toBe(`/${uuid}/settings`);
  });
});

describe("buildTicketDetailRoute", () => {
  it("should build the canonical ticket detail page route", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    const ticketId = "987e6543-e21b-45d3-a456-426614174999";

    expect(buildTicketDetailRoute(uuid, ticketId)).toBe(
      `/${uuid}/board/tickets/${ticketId}`
    );
  });
});

describe("normalizePath", () => {
  it("should remove trailing slash", () => {
    expect(normalizePath("/workspace/")).toBe("/workspace");
    expect(normalizePath("/account/")).toBe("/account");
  });

  it("should preserve root path", () => {
    expect(normalizePath("/")).toBe("/");
  });

  it("should return path unchanged when no trailing slash", () => {
    expect(normalizePath("/workspace")).toBe("/workspace");
    expect(normalizePath("/auth/signin")).toBe("/auth/signin");
  });
});

describe("isActiveHref", () => {
  it("should return true for exact match", () => {
    expect(isActiveHref("/workspace", "/workspace")).toBe(true);
  });

  it("should return true for sub-path match by default", () => {
    expect(isActiveHref("/workspace/sub", "/workspace")).toBe(true);
  });

  it("should return false for sub-path match with exactOnly", () => {
    expect(
      isActiveHref("/workspace/sub", "/workspace", { exactOnly: true })
    ).toBe(false);
  });

  it("should return true for exact match with exactOnly", () => {
    expect(isActiveHref("/workspace", "/workspace", { exactOnly: true })).toBe(
      true
    );
  });

  it("should return false for non-matching paths", () => {
    expect(isActiveHref("/account", "/workspace")).toBe(false);
  });

  it("should handle trailing slashes correctly", () => {
    expect(isActiveHref("/workspace/", "/workspace")).toBe(true);
    expect(isActiveHref("/workspace", "/workspace/")).toBe(true);
  });

  it("should not match partial path segments", () => {
    expect(isActiveHref("/workspace-other", "/workspace")).toBe(false);
  });
});
