import { renderHook } from "@testing-library/react";

import { LocaleProvider } from "@/shared/i18n/LocaleProvider";

import { useLastActivitySubtitle } from "@/domains/workspace/presentation/hooks/useLastActivitySubtitle";

//missing display name
const createWrapper = (initialLocale: "fr" | "en") => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <LocaleProvider initialLocale={initialLocale} key={initialLocale}>
        {children}
      </LocaleProvider>
    );
  };
  Wrapper.displayName = "Wrapper";
  return Wrapper;
};

describe("useLastActivitySubtitle", () => {
  it("formats fallback dates with the active locale instead of the runtime default", () => {
    const { result } = renderHook(() => useLastActivitySubtitle(), {
      wrapper: createWrapper("fr"),
    });

    const subtitle = result.current(
      new Date("2026-03-31T12:00:00Z"),
      new Date("2026-04-08T12:00:00Z")
    );

    expect(subtitle).toBe("Dernière activité: 31/03/2026");
  });

  it("uses the provided reference date for relative thresholds", () => {
    const { result } = renderHook(() => useLastActivitySubtitle(), {
      wrapper: createWrapper("fr"),
    });

    const subtitle = result.current(
      new Date("2026-04-07T11:00:00Z"),
      new Date("2026-04-08T12:00:00Z")
    );

    expect(subtitle).toBe("Dernière activité: 1 jour");
  });
});
