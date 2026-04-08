"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { usePathname } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useTranslations } from "@/shared/i18n";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type BoundaryFallbackProps = {
  error: Error;
  reset: () => void;
};

type BoundaryProps = {
  children: ReactNode;
  resetKey: string;
  fallback: (props: BoundaryFallbackProps) => ReactNode;
};

type BoundaryState = {
  error: Error | null;
};

class InternalAppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error boundary caught an error", error, errorInfo);
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.reset,
      });
    }

    return this.props.children;
  }
}

const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  const pathname = usePathname() ?? "";
  const t = useTranslations("pages.fallback");

  return (
    <InternalAppErrorBoundary
      resetKey={pathname}
      fallback={({ error, reset }) => (
        <RouteFallbackPage
          tone="error"
          eyebrow={t("error.eyebrow")}
          statusLabel={t("error.status")}
          statusValue="500"
          title={t("error.title")}
          message={t("error.message")}
          detail={
            process.env.NODE_ENV === "development" ? error.message : undefined
          }
          actions={[
            {
              label: t("error.primaryAction"),
              ariaLabel: t("error.primaryActionAriaLabel"),
              onClick: reset,
              variant: "primary",
            },
            {
              label: t("error.secondaryAction"),
              ariaLabel: t("error.secondaryActionAriaLabel"),
              href: PAGE_ROUTES.HOME,
              variant: "secondary",
            },
          ]}
        />
      )}
    >
      {children}
    </InternalAppErrorBoundary>
  );
};

export default AppErrorBoundary;
