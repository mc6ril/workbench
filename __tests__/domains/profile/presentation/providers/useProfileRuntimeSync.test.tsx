import { NextIntlClientProvider } from "next-intl";
import { renderHook, waitFor } from "@testing-library/react";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

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

jest.mock("@/shared/theme/config", () => ({
  persistThemeCookie: jest.fn(),
}));

const { persistThemeCookie: persistThemeCookieMock } = jest.requireMock(
  "@/shared/theme/config"
) as {
  persistThemeCookie: jest.Mock;
};

jest.mock("@/domains/auth/presentation/hooks/identity/useAuthIdentity", () => ({
  useAuthIdentity: jest.fn(),
}));

jest.mock("@/domains/profile/presentation/hooks/useMyProfile", () => ({
  useMyProfile: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider locale="en">{children}</NextIntlClientProvider>
  );
};

describe("useProfileRuntimeSync", () => {
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

    jest.mocked(useMyProfile).mockReturnValue(
      asMockedReturn<ReturnType<typeof useMyProfile>>({
        data: undefined,
        isLoading: false,
        isPending: false,
        isError: false,
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stays ready for anonymous identities", () => {
    const { result } = renderHook(() => useProfileRuntimeSync(), { wrapper });

    expect(result.current).toBe(true);
    expect(setThemeMock).not.toHaveBeenCalled();
    expect(persistLocaleCookieMock).not.toHaveBeenCalled();
    expect(persistThemeCookieMock).not.toHaveBeenCalled();
  });

  it("stays ready while the authenticated profile is still loading", () => {
    jest.mocked(useAuthIdentity).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAuthIdentity>>({
        data: { userId: "user-1" },
        isLoading: false,
        isPending: false,
      })
    );

    jest.mocked(useMyProfile).mockReturnValue(
      asMockedReturn<ReturnType<typeof useMyProfile>>({
        data: undefined,
        isLoading: true,
        isPending: true,
        isError: false,
      })
    );

    const { result } = renderHook(() => useProfileRuntimeSync(), { wrapper });

    expect(result.current).toBe(true);
    expect(setThemeMock).not.toHaveBeenCalled();
    expect(persistLocaleCookieMock).not.toHaveBeenCalled();
    expect(persistThemeCookieMock).not.toHaveBeenCalled();
  });

  it("stays ready once the profile is available while applying locale cookie and theme", async () => {
    jest.mocked(useAuthIdentity).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAuthIdentity>>({
        data: { userId: "user-1" },
        isLoading: false,
        isPending: false,
      })
    );

    jest.mocked(useMyProfile).mockReturnValue(
      asMockedReturn<ReturnType<typeof useMyProfile>>({
        data: {
          preferences: {
            ...DEFAULT_USER_PREFERENCES,
            language: "fr",
            theme: "dark",
          },
        },
        isLoading: false,
        isPending: false,
        isError: false,
      })
    );

    const { result } = renderHook(() => useProfileRuntimeSync(), { wrapper });

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
