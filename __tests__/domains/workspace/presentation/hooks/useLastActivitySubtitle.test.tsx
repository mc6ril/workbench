import { renderHook } from "@testing-library/react";

import { useLastActivitySubtitle } from "@/domains/workspace/presentation/hooks/useLastActivitySubtitle";

jest.mock("@/shared/i18n", () => {
  const actual = jest.requireActual("@/shared/i18n/config");
  return {
    getIntlLocale: actual.getIntlLocale,
    useLocale: () => "fr",
    useTranslations: () => (key: string, params?: Record<string, string | number>) => {
      if (key === "lastActivityDate") {
        return `Dernière activité: ${params?.date ?? ""}`;
      }
      if (key === "lastActivityDays") {
        return params?.days === 1
          ? "Dernière activité: 1 jour"
          : `Dernière activité: ${params?.days ?? ""} jours`;
      }
      if (key === "lastActivityHours") {
        return params?.hours === 1
          ? "Dernière activité: 1 heure"
          : `Dernière activité: ${params?.hours ?? ""} heures`;
      }
      if (key === "lastActivityNow") {
        return "Dernière activité: à l'instant";
      }
      return key;
    },
  };
});

describe("useLastActivitySubtitle", () => {
  it("formats fallback dates with the active locale instead of the runtime default", () => {
    const { result } = renderHook(() => useLastActivitySubtitle());

    const subtitle = result.current(
      new Date("2026-03-31T12:00:00Z"),
      new Date("2026-04-08T12:00:00Z")
    );

    expect(subtitle).toBe("Dernière activité: 31/03/2026");
  });

  it("uses the provided reference date for relative thresholds", () => {
    const { result } = renderHook(() => useLastActivitySubtitle());

    const subtitle = result.current(
      new Date("2026-04-07T11:00:00Z"),
      new Date("2026-04-08T12:00:00Z")
    );

    expect(subtitle).toBe("Dernière activité: 1 jour");
  });
});
