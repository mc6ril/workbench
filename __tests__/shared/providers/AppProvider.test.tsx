import { render, screen } from "@testing-library/react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import AppProvider from "@/shared/providers/AppProvider";

import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

jest.mock("next/navigation", () => ({
  usePathname: () => PAGE_ROUTES.WORKSPACE,
}));

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/shared/providers/AppErrorBoundary", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/shared/providers/ReactQueryProvider", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/shared/design-system/toast", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/shared/navigation/NavigationFeedbackController", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock(
  "@/domains/profile/presentation/providers/useProfileRuntimeSync",
  () => ({
    useProfileRuntimeSync: jest.fn(),
  })
);

describe("AppProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children and mounts profile preference sync", () => {
    render(
      <AppProvider>
        <div>app content</div>
      </AppProvider>
    );

    expect(screen.getByText("app content")).toBeInTheDocument();
    expect(useProfileRuntimeSync).toHaveBeenCalled();
  });
});
