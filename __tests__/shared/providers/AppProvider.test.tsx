import { ThemeProvider } from "next-themes";
import { render, screen } from "@testing-library/react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import AppProvider from "@/shared/providers/AppProvider";

import { useAccountRuntimeSync } from "@/domains/account/presentation/hooks/useAccountRuntimeSync";

jest.mock("next/navigation", () => ({
  usePathname: () => PAGE_ROUTES.WORKSPACE,
}));

jest.mock("next-themes", () => ({
  ThemeProvider: jest.fn(
    ({ children }: { children: React.ReactNode }) => children
  ),
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

jest.mock("@/domains/account/presentation/hooks/useAccountRuntimeSync", () => ({
  useAccountRuntimeSync: jest.fn(),
}));

describe("AppProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children and mounts profile preference sync", () => {
    render(
      <AppProvider initialTheme="dark">
        <div>app content</div>
      </AppProvider>
    );

    expect(screen.getByText("app content")).toBeInTheDocument();
    expect(useAccountRuntimeSync).toHaveBeenCalled();
    expect(jest.mocked(ThemeProvider)).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "data-theme",
        defaultTheme: "dark",
        enableSystem: true,
      }),
      undefined
    );
  });
});
