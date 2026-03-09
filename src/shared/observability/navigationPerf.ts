type NavigationSource =
  | "sidebar"
  | "profile-menu"
  | "workspace-card"
  | "programmatic"
  | "unknown";

type SupabaseHttpKind = "rest" | "rpc" | "auth" | "other";

type NavigationSample = {
  from: string;
  to: string;
  source: NavigationSource;
  durationMs: number;
  startedAt: number;
  endedAt: number;
};

type SupabaseHttpSample = {
  method: string;
  path: string;
  kind: SupabaseHttpKind;
  status: number | null;
  durationMs: number;
  timestamp: number;
};

type PendingNavigation = {
  from: string;
  to: string;
  source: NavigationSource;
  startedAt: number;
};

const MAX_SAMPLES = 500;
const PERF_WINDOW_KEY = "__WORKBENCH_NAV_PERF__";
const PERF_FLAG = process.env.NEXT_PUBLIC_ENABLE_NAV_PERF === "1";

const state: {
  pendingNavigation: PendingNavigation | null;
  navigations: NavigationSample[];
  supabaseHttp: SupabaseHttpSample[];
  fullPageLoaderCount: number;
  isBoundToWindow: boolean;
} = {
  pendingNavigation: null,
  navigations: [],
  supabaseHttp: [],
  fullPageLoaderCount: 0,
  isBoundToWindow: false,
};

type PerfWindowApi = {
  snapshot: () => ReturnType<typeof getNavigationPerfSnapshot>;
  reset: () => void;
};

const isBrowser = (): boolean => typeof window !== "undefined";

const getPerfWindow = (): Window & {
  __WORKBENCH_NAV_PERF__?: PerfWindowApi;
} => {
  return window as Window & {
    __WORKBENCH_NAV_PERF__?: PerfWindowApi;
  };
};

const isEnabled = (): boolean => {
  return isBrowser() && PERF_FLAG;
};

const pushBounded = <T>(target: T[], value: T): void => {
  target.push(value);
  if (target.length > MAX_SAMPLES) {
    target.shift();
  }
};

const normalizePath = (value: string): string => {
  const noQuery = value.split("?")[0] ?? value;
  if (noQuery.length > 1 && noQuery.endsWith("/")) {
    return noQuery.slice(0, -1);
  }
  return noQuery || "/";
};

const toNumber = (value: number): number => {
  if (Number.isFinite(value) && value >= 0) {
    return value;
  }
  return 0;
};

const percentile = (values: number[], targetPercentile: number): number => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((targetPercentile / 100) * sorted.length) - 1;
  const safeIndex = Math.min(Math.max(rank, 0), sorted.length - 1);
  return Math.round(sorted[safeIndex] * 100) / 100;
};

const getSupabaseHttpKind = (path: string): SupabaseHttpKind => {
  if (path.includes("/rest/v1/rpc/")) {
    return "rpc";
  }
  if (path.includes("/rest/v1/")) {
    return "rest";
  }
  if (path.includes("/auth/v1/")) {
    return "auth";
  }
  return "other";
};

const bindToWindow = (): void => {
  if (!isEnabled() || state.isBoundToWindow) {
    return;
  }

  const perfWindow = getPerfWindow();
  perfWindow[PERF_WINDOW_KEY] = {
    snapshot: () => getNavigationPerfSnapshot(),
    reset: () => resetNavigationPerfMetrics(),
  };
  state.isBoundToWindow = true;
};

const toPathname = (input: RequestInfo | URL): string => {
  try {
    if (typeof input === "string") {
      return new URL(input, window.location.origin).pathname;
    }
    if (input instanceof URL) {
      return input.pathname;
    }
    return new URL(input.url, window.location.origin).pathname;
  } catch {
    if (typeof input === "string") {
      return input;
    }
    if (input instanceof Request) {
      return input.url;
    }
    return input.pathname;
  }
};

export const createInstrumentedSupabaseFetch = (
  baseFetch: typeof fetch
): typeof fetch => {
  if (!isEnabled()) {
    return baseFetch;
  }

  bindToWindow();

  return async (input, init) => {
    const start = performance.now();
    const method = (init?.method ?? "GET").toUpperCase();
    const path = toPathname(input);
    const kind = getSupabaseHttpKind(path);

    if (kind === "other") {
      return baseFetch(input, init);
    }

    try {
      const response = await baseFetch(input, init);

      pushBounded(state.supabaseHttp, {
        method,
        path,
        kind,
        status: response.status,
        durationMs: toNumber(performance.now() - start),
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      pushBounded(state.supabaseHttp, {
        method,
        path,
        kind,
        status: null,
        durationMs: toNumber(performance.now() - start),
        timestamp: Date.now(),
      });

      throw error;
    }
  };
};

export const markNavigationStart = (
  to: string,
  source: NavigationSource = "unknown",
  from?: string
): void => {
  if (!isEnabled()) {
    return;
  }

  bindToWindow();

  state.pendingNavigation = {
    from: normalizePath(from ?? window.location.pathname),
    to: normalizePath(to),
    source,
    startedAt: performance.now(),
  };
};

export const markNavigationSettled = (pathname: string): void => {
  if (!isEnabled()) {
    return;
  }

  bindToWindow();

  const pending = state.pendingNavigation;
  if (!pending) {
    return;
  }

  const settledPath = normalizePath(pathname);
  if (settledPath !== pending.to) {
    return;
  }

  const endedAt = performance.now();
  pushBounded(state.navigations, {
    from: pending.from,
    to: pending.to,
    source: pending.source,
    durationMs: toNumber(endedAt - pending.startedAt),
    startedAt: pending.startedAt,
    endedAt,
  });

  state.pendingNavigation = null;
};

export const recordFullPageLoaderShown = (): void => {
  if (!isEnabled()) {
    return;
  }

  bindToWindow();
  state.fullPageLoaderCount += 1;
};

export const resetNavigationPerfMetrics = (): void => {
  state.pendingNavigation = null;
  state.navigations = [];
  state.supabaseHttp = [];
  state.fullPageLoaderCount = 0;
};

export const getNavigationPerfSnapshot = () => {
  const navigationDurations = state.navigations.map(
    (sample) => sample.durationMs
  );

  const requestByKind = state.supabaseHttp.reduce<
    Record<SupabaseHttpKind, number>
  >(
    (acc, request) => {
      acc[request.kind] += 1;
      return acc;
    },
    {
      rest: 0,
      rpc: 0,
      auth: 0,
      other: 0,
    }
  );

  return {
    enabled: isEnabled(),
    pendingNavigation: state.pendingNavigation,
    counts: {
      navigationSamples: state.navigations.length,
      supabaseRequests: state.supabaseHttp.length,
      fullPageLoaderCount: state.fullPageLoaderCount,
      requestsByKind: requestByKind,
    },
    navigation: {
      p50Ms: percentile(navigationDurations, 50),
      p95Ms: percentile(navigationDurations, 95),
      samples: [...state.navigations],
    },
    supabaseHttp: {
      samples: [...state.supabaseHttp],
    },
  };
};

export const isNavigationPerfEnabled = (): boolean => isEnabled();
