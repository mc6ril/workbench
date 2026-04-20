/**
 * @jest-environment node
 */
import messagesEn from "../../../src/shared/i18n/messages/en.json";
import messagesEs from "../../../src/shared/i18n/messages/es.json";

const cookiesMock = jest.fn();
const headersMock = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
  headers: () => headersMock(),
}));

type CookieStoreLike = {
  get: (name: string) => { value: string } | undefined;
};

const createCookieStore = (locale?: string) =>
  ({
    get: (name: string) => {
      if (name !== "workbench-locale" || !locale) {
        return undefined;
      }

      return { value: locale };
    },
  }) satisfies CookieStoreLike;

describe("shared i18n request config", () => {
  beforeEach(() => {
    jest.resetModules();
    cookiesMock.mockReset();
    headersMock.mockReset();
    headersMock.mockResolvedValue(new Headers());
  });

  it("falls back to the locale cookie when requestLocale is missing", async () => {
    cookiesMock.mockResolvedValue(createCookieStore("en"));

    const { default: getRequestConfig } = await import("@/shared/i18n/request");
    const result = await getRequestConfig({
      requestLocale: Promise.resolve(undefined),
    });

    expect(result.locale).toBe("en");
    expect(result.messages).toEqual(messagesEn);
  });

  it("keeps an explicit request locale ahead of the cookie", async () => {
    cookiesMock.mockResolvedValue(createCookieStore("en"));

    const { default: getRequestConfig } = await import("@/shared/i18n/request");
    const result = await getRequestConfig({
      requestLocale: Promise.resolve("es"),
    });

    expect(result.locale).toBe("es");
    expect(result.messages).toEqual(messagesEs);
    expect(cookiesMock).not.toHaveBeenCalled();
    expect(headersMock).not.toHaveBeenCalled();
  });
});
