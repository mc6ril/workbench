import { render, screen } from "@testing-library/react";

import { LocaleProvider } from "@/shared/i18n/LocaleProvider";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";

const LocaleProbe = () => {
  const locale = useLocaleStore((state) => state.locale);

  return <span>{locale}</span>;
};

describe("LocaleProvider", () => {
  it("updates the active locale when the initial locale prop changes", () => {
    const { rerender } = render(
      <LocaleProvider key="fr" initialLocale="fr">
        <LocaleProbe />
      </LocaleProvider>
    );

    expect(screen.getByText("fr")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("fr-FR");

    rerender(
      <LocaleProvider key="en" initialLocale="en">
        <LocaleProbe />
      </LocaleProvider>
    );

    expect(screen.getByText("en")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en-US");
  });
});
