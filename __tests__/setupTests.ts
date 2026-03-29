import "@testing-library/jest-dom";

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
 */
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
