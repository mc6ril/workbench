import "@testing-library/jest-dom";

/**
 * next-intl ships ESM-only browser bundles; Jest/ts-jest do not transform them by default.
 * Provide a minimal in-memory translator using `fr.json` so component tests match production keys.
 */
jest.mock("next-intl", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const messagesFr = require("../src/shared/i18n/messages/fr.json") as Record<
    string,
    unknown
  >;

  const interpolate = (
    template: string,
    params?: Record<string, string | number>
  ): string => {
    if (!params) {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      String(params[name] ?? `{${name}}`)
    );
  };

  const resolveValue = (
    namespace: string,
    key: string
  ): string | undefined => {
    const path = namespace ? `${namespace}.${key}` : key;
    const parts = path.split(".");
    let current: unknown = messagesFr;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof current === "string" ? current : undefined;
  };

  const translatorCache = new Map<string, ReturnType<typeof createTranslator>>();

  function createTranslator(namespace: string) {
    const t = (
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const value = resolveValue(namespace, key);
      if (value !== undefined) {
        return interpolate(value, params);
      }
      return key;
    };
    t.has = (key: string): boolean => {
      return resolveValue(namespace, key) !== undefined;
    };
    return t;
  }

  const useTranslations = (namespace: string) => {
    let translator = translatorCache.get(namespace);
    if (!translator) {
      translator = createTranslator(namespace);
      translatorCache.set(namespace, translator);
    }
    return translator;
  };

  return {
    __esModule: true,
    NextIntlClientProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
    useLocale: () => "fr",
    useTranslations,
  };
});

jest.mock("next-intl/server", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const messagesFr = require("../src/shared/i18n/messages/fr.json") as Record<
    string,
    unknown
  >;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const messagesEn = require("../src/shared/i18n/messages/en.json") as Record<
    string,
    unknown
  >;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const messagesEs = require("../src/shared/i18n/messages/es.json") as Record<
    string,
    unknown
  >;

  const messagesByLocale: Record<string, Record<string, unknown>> = {
    fr: messagesFr,
    en: messagesEn,
    es: messagesEs,
  };

  const interpolate = (
    template: string,
    params?: Record<string, string | number>
  ): string => {
    if (!params) {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      String(params[name] ?? `{${name}}`)
    );
  };

  const resolveValue = (
    locale: string | undefined,
    namespace: string | undefined,
    key: string
  ): string | undefined => {
    const path = namespace ? `${namespace}.${key}` : key;
    const parts = path.split(".");
    const messages = messagesByLocale[locale ?? "fr"] ?? messagesFr;
    let current: unknown = messages;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof current === "string" ? current : undefined;
  };

  const getTranslations = async ({
    locale,
    namespace,
  }: {
    locale?: string;
    namespace?: string;
  } = {}) => {
    const t = (
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const value = resolveValue(locale, namespace, key);
      if (value !== undefined) {
        return interpolate(value, params);
      }
      return key;
    };
    t.has = (key: string): boolean => {
      return resolveValue(locale, namespace, key) !== undefined;
    };
    return t;
  };

  return {
    __esModule: true,
    getLocale: async () => "fr",
    getMessages: async ({ locale }: { locale?: string } = {}) =>
      messagesByLocale[locale ?? "fr"] ?? messagesFr,
    getRequestConfig: <T>(factory: T) => factory,
    getTranslations,
    setRequestLocale: jest.fn(),
  };
});

jest.mock("@sentry/nextjs", () => ({
  __esModule: true,
  captureException: jest.fn(),
  captureRouterTransitionStart: jest.fn(),
  captureRequestError: jest.fn(),
  init: jest.fn(),
  replayIntegration: jest.fn(() => ({})),
}));

/**
 * Browser Supabase repositories instantiate the client at module load time.
 * CI and agents often run tests without .env.local; provide safe placeholders so imports resolve.
 * Real values from the environment take precedence when present.
 */
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
}

if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
    "jest-test-publishable-key";
}

/**
 * jsdom does not implement matchMedia; components using viewport hooks need a minimal stub.
 * Node-only test files (e.g. middleware) use @jest-environment node and have no window.
 */
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
