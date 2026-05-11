import {
  AUTH_PAGE_ROUTES,
  PAGE_ROUTES,
  PROJECT_VIEWS,
} from "@/shared/constants/routes";
import { buildMarketingLegalPath } from "@/shared/i18n/marketingPaths";
import {
  buildProjectRoute,
  buildTicketDetailRoute,
  extractProjectId,
  extractProjectView,
  isActiveHref,
  isMarketingPublicRoute,
  isProjectRoute,
  isProtectedRoute,
  isPublicRoute,
  normalizePath,
} from "@/shared/utils/routes";

const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";
const TICKET_ID = "987e6543-e21b-45d3-a456-426614174999";
const DEFAULT_LOCALE_PREFIXED_HOME = "/fr";

describe("isPublicRoute", () => {
  it("should return true for known public routes", () => {
    expect(isPublicRoute(PAGE_ROUTES.HOME)).toBe(true);
    expect(isPublicRoute(PAGE_ROUTES.LEGAL)).toBe(true);
    expect(isPublicRoute(AUTH_PAGE_ROUTES.SIGNIN)).toBe(true);
    expect(isPublicRoute(AUTH_PAGE_ROUTES.SIGNUP)).toBe(true);
    expect(isPublicRoute(AUTH_PAGE_ROUTES.VERIFY_EMAIL)).toBe(true);
    expect(isPublicRoute(AUTH_PAGE_ROUTES.RESET_PASSWORD)).toBe(true);
    expect(isPublicRoute(AUTH_PAGE_ROUTES.UPDATE_PASSWORD)).toBe(true);
    expect(isPublicRoute(AUTH_PAGE_ROUTES.CALLBACK)).toBe(true);
    expect(isPublicRoute(DEFAULT_LOCALE_PREFIXED_HOME)).toBe(true);
    expect(isPublicRoute(buildMarketingLegalPath("es"))).toBe(true);
  });

  it("should return false for non-public routes", () => {
    expect(isPublicRoute(PAGE_ROUTES.WORKSPACE)).toBe(false);
    expect(isPublicRoute(PAGE_ROUTES.ACCOUNT)).toBe(false);
    expect(isPublicRoute(PAGE_ROUTES.RUNTIME_CONFIG_LAB)).toBe(false);
    expect(isPublicRoute("/unknown")).toBe(false);
  });
});

describe("isMarketingPublicRoute", () => {
  it("should return true for marketing paths", () => {
    expect(isMarketingPublicRoute(PAGE_ROUTES.HOME)).toBe(true);
    expect(isMarketingPublicRoute(PAGE_ROUTES.LEGAL)).toBe(true);
    expect(isMarketingPublicRoute(DEFAULT_LOCALE_PREFIXED_HOME)).toBe(true);
    expect(isMarketingPublicRoute(buildMarketingLegalPath("es"))).toBe(true);
  });

  it("should return false for non-marketing paths", () => {
    expect(isMarketingPublicRoute(PAGE_ROUTES.WORKSPACE)).toBe(false);
    expect(isMarketingPublicRoute("/fr/board")).toBe(false);
  });
});

describe("isProtectedRoute", () => {
  it("should return true for exact protected routes", () => {
    expect(isProtectedRoute(PAGE_ROUTES.WORKSPACE)).toBe(true);
    expect(isProtectedRoute(PAGE_ROUTES.ACCOUNT)).toBe(true);
    expect(isProtectedRoute(PAGE_ROUTES.RUNTIME_CONFIG_LAB)).toBe(true);
  });

  it("should return true for project routes", () => {
    expect(isProtectedRoute(`/${PROJECT_ID}`)).toBe(true);
    expect(
      isProtectedRoute(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD))
    ).toBe(true);
    expect(
      isProtectedRoute(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.SETTINGS))
    ).toBe(true);
  });

  it("should return false for public routes", () => {
    expect(isProtectedRoute(PAGE_ROUTES.HOME)).toBe(false);
    expect(isProtectedRoute(AUTH_PAGE_ROUTES.SIGNIN)).toBe(false);
  });

  it("should return false for non-matching routes", () => {
    expect(isProtectedRoute("/random")).toBe(false);
    expect(isProtectedRoute("/not-a-uuid/board")).toBe(false);
  });
});

describe("isProjectRoute", () => {
  it("should return true for valid project routes", () => {
    expect(
      isProjectRoute(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD))
    ).toBe(true);
    expect(
      isProjectRoute(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.SETTINGS))
    ).toBe(true);
  });

  it("should return true for nested project routes", () => {
    expect(
      isProjectRoute(
        `${buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD)}/detail`
      )
    ).toBe(true);
  });

  it("should return true for project root route", () => {
    expect(isProjectRoute(`/${PROJECT_ID}`)).toBe(true);
  });

  it("should return false for non-project routes", () => {
    expect(isProjectRoute(PAGE_ROUTES.WORKSPACE)).toBe(false);
    expect(isProjectRoute("/not-uuid/board")).toBe(false);
  });
});

describe("extractProjectId", () => {
  it("should extract project ID from project route", () => {
    expect(
      extractProjectId(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD))
    ).toBe(PROJECT_ID);
    expect(
      extractProjectId(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.SETTINGS))
    ).toBe(PROJECT_ID);
  });

  it("should extract project ID from root project path", () => {
    expect(extractProjectId(`/${PROJECT_ID}`)).toBe(PROJECT_ID);
  });

  it("should return null for non-project routes", () => {
    expect(extractProjectId(PAGE_ROUTES.WORKSPACE)).toBeNull();
    expect(extractProjectId(AUTH_PAGE_ROUTES.SIGNIN)).toBeNull();
    expect(extractProjectId(PAGE_ROUTES.HOME)).toBeNull();
  });
});

describe("extractProjectView", () => {
  it("should extract view name from project route", () => {
    expect(
      extractProjectView(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD))
    ).toBe(PROJECT_VIEWS.BOARD);
    expect(
      extractProjectView(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.SETTINGS))
    ).toBe(PROJECT_VIEWS.SETTINGS);
  });

  it("should return null when no view present", () => {
    expect(extractProjectView(`/${PROJECT_ID}`)).toBeNull();
  });

  it("should return null for non-project routes", () => {
    expect(extractProjectView(PAGE_ROUTES.WORKSPACE)).toBeNull();
    expect(extractProjectView(PAGE_ROUTES.HOME)).toBeNull();
  });
});

describe("buildProjectRoute", () => {
  it("should build a project route from ID and view", () => {
    expect(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD)).toBe(
      `/${PROJECT_ID}/${PROJECT_VIEWS.BOARD}`
    );
    expect(buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.SETTINGS)).toBe(
      `/${PROJECT_ID}/${PROJECT_VIEWS.SETTINGS}`
    );
  });
});

describe("buildTicketDetailRoute", () => {
  it("should build the canonical ticket detail page route", () => {
    expect(buildTicketDetailRoute(PROJECT_ID, TICKET_ID)).toBe(
      `${buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD)}/tickets/${TICKET_ID}`
    );
  });
});

describe("normalizePath", () => {
  it("should remove trailing slash", () => {
    expect(normalizePath(`${PAGE_ROUTES.WORKSPACE}/`)).toBe(
      PAGE_ROUTES.WORKSPACE
    );
    expect(normalizePath(`${PAGE_ROUTES.ACCOUNT}/`)).toBe(PAGE_ROUTES.ACCOUNT);
  });

  it("should preserve root path", () => {
    expect(normalizePath(PAGE_ROUTES.HOME)).toBe(PAGE_ROUTES.HOME);
  });

  it("should return path unchanged when no trailing slash", () => {
    expect(normalizePath(PAGE_ROUTES.WORKSPACE)).toBe(PAGE_ROUTES.WORKSPACE);
    expect(normalizePath(AUTH_PAGE_ROUTES.SIGNIN)).toBe(
      AUTH_PAGE_ROUTES.SIGNIN
    );
  });
});

describe("isActiveHref", () => {
  it("should return true for exact match", () => {
    expect(isActiveHref(PAGE_ROUTES.WORKSPACE, PAGE_ROUTES.WORKSPACE)).toBe(
      true
    );
  });

  it("should return true for sub-path match by default", () => {
    expect(
      isActiveHref(`${PAGE_ROUTES.WORKSPACE}/sub`, PAGE_ROUTES.WORKSPACE)
    ).toBe(true);
  });

  it("should return false for sub-path match with exactOnly", () => {
    expect(
      isActiveHref(`${PAGE_ROUTES.WORKSPACE}/sub`, PAGE_ROUTES.WORKSPACE, {
        exactOnly: true,
      })
    ).toBe(false);
  });

  it("should return true for exact match with exactOnly", () => {
    expect(
      isActiveHref(PAGE_ROUTES.WORKSPACE, PAGE_ROUTES.WORKSPACE, {
        exactOnly: true,
      })
    ).toBe(true);
  });

  it("should return false for non-matching paths", () => {
    expect(isActiveHref(PAGE_ROUTES.ACCOUNT, PAGE_ROUTES.WORKSPACE)).toBe(
      false
    );
  });

  it("should handle trailing slashes correctly", () => {
    expect(
      isActiveHref(`${PAGE_ROUTES.WORKSPACE}/`, PAGE_ROUTES.WORKSPACE)
    ).toBe(true);
    expect(
      isActiveHref(PAGE_ROUTES.WORKSPACE, `${PAGE_ROUTES.WORKSPACE}/`)
    ).toBe(true);
  });

  it("should not match partial path segments", () => {
    expect(isActiveHref("/workspace-other", PAGE_ROUTES.WORKSPACE)).toBe(false);
  });
});
