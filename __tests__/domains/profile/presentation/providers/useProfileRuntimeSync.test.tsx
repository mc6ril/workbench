import { renderHook, waitFor } from "@testing-library/react";

import * as i18nConfig from "@/shared/i18n/config";
import { LocaleProvider } from "@/shared/i18n/LocaleProvider";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

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

jest.mock("@/domains/session/presentation/hooks/useSession", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/domains/profile/presentation/hooks/useMyProfile", () => ({
  useMyProfile: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocaleProvider initialLocale="en" key="en">
      {children}
    </LocaleProvider>
  );
};

describe("useProfileRuntimeSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    themeValue = "system";

    jest.mocked(useSession).mockReturnValue(
      asMockedReturn<ReturnType<typeof useSession>>({
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

    jest.spyOn(i18nConfig, "persistLocaleCookie").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stays ready for anonymous sessions", () => {
    const { result } = renderHook(() => useProfileRuntimeSync(), { wrapper });

    expect(result.current).toBe(true);
    expect(setThemeMock).not.toHaveBeenCalled();
    expect(i18nConfig.persistLocaleCookie).not.toHaveBeenCalled();
  });

  it("blocks runtime readiness while the authenticated profile is still loading", () => {
    jest.mocked(useSession).mockReturnValue(
      asMockedReturn<ReturnType<typeof useSession>>({
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

    expect(result.current).toBe(false);
  });

  it("applies locale and theme before reporting the runtime as ready", async () => {
    jest.mocked(useSession).mockReturnValue(
      asMockedReturn<ReturnType<typeof useSession>>({
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

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(setThemeMock).toHaveBeenCalledWith("dark");
    expect(i18nConfig.persistLocaleCookie).toHaveBeenCalledWith("fr");
  });
});
