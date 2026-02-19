import { create } from "zustand";

type ToastVariant = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
};

type ToastState = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const DEFAULT_DURATION_MS = 5000;

let toastCounter = 0;

/**
 * UI-only store for managing transient toast notifications.
 * Toasts auto-dismiss after their configured duration.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const duration = toast.duration || DEFAULT_DURATION_MS;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, duration }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
