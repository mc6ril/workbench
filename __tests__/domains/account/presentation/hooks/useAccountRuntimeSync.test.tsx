import { NextIntlClientProvider } from "next-intl";
import { renderHook, waitFor } from "@testing-library/react";

import { DEFAULT_USER_PREFERENCES } from "@/shared/user/userPreferences";

import { useAccountRuntimeSync } from "@/domains/account/presentation/hooks/useAccountRuntimeSync";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";

let themeValue: string | undefined = "system";
const setThemeMock = jest.fn((nextTheme: string) => {
  themeValue = nextTheme;
});

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: themeValue,
    setTheme: setThemeMock,
  }),
}));

jest.mock("@/shared/i18n", () => {
  const actual = jest.requireActual("@/shared/i18n");

  return {
    ...actual,
    persistLocaleCookie: jest.fn(),
    useLocale: jest.fn(() => "en"),
  };
});

const { persistLocaleCookie: persistLocaleCookieMock } = jest.requireMock(
  "@/shared/i18n"
) as {
  persistLocaleCookie: jest.Mock;
};

jest.mock("@/shared/theme/config", () => {
  const actual = jest.requireActual<typeof import("@/shared/theme/config")>(
    "@/shared/theme/config"
  );

  return {
    ...actual,
    persistThemeCookie: jest.fn(),
  };
});

const { persistThemeCookie: persistThemeCookieMock } = jest.requireMock(
  "@/shared/theme/config"
) as {
  persistThemeCookie: jest.Mock;
};

jest.mock("@/domains/auth/presentation/hooks/identity/useAuthIdentity", () => ({
  useAuthIdentity: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider locale="en">{children}</NextIntlClientProvider>
  );
};

describe("useAccountRuntimeSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    themeValue = "system";

    jest.mocked(useAuthIdentity).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAuthIdentity>>({
        data: undefined,
        isLoading: false,
        isPending: false,
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stays ready for anonymous identities", () => {
    const { result } = renderHook(() => useAccountRuntimeSync(), { wrapper });

    expect(result.current).toBe(true);
    expect(setThemeMock).not.toHaveBeenCalled();
    expect(persistLocaleCookieMock).not.toHaveBeenCalled();
    expect(persistThemeCookieMock).not.toHaveBeenCalled();
  });

  it("stays ready while identity is loading", () => {
    jest.mocked(useAuthIdentity).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAuthIdentity>>({
        data: undefined,
        isLoading: true,
        isPending: true,
      })
    );

    const { result } = renderHook(() => useAccountRuntimeSync(), { wrapper });

    expect(result.current).toBe(true);
    expect(setThemeMock).not.toHaveBeenCalled();
    expect(persistLocaleCookieMock).not.toHaveBeenCalled();
    expect(persistThemeCookieMock).not.toHaveBeenCalled();
  });

  it("applies locale cookie and theme from JWT claims without a DB call", async () => {
    jest.mocked(useAuthIdentity).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAuthIdentity>>({
        data: {
          userId: "user-1",
          loginEmail: "user@example.com",
          isSuperuser: false,
          canUpdatePassword: false,
          preferences: {
            ...DEFAULT_USER_PREFERENCES,
            language: "fr",
            theme: "dark",
          },
        },
        isLoading: false,
        isPending: false,
      })
    );

    const { result } = renderHook(() => useAccountRuntimeSync(), { wrapper });

    expect(result.current).toBe(true);

    await waitFor(() => {
      expect(setThemeMock).toHaveBeenCalledWith("dark");
    });

    await waitFor(() => {
      expect(persistLocaleCookieMock).toHaveBeenCalledWith("fr");
    });

    await waitFor(() => {
      expect(persistThemeCookieMock).toHaveBeenCalledWith("dark");
    });
  });
});
