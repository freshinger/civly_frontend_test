import { create } from "zustand";

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
  isExiting?: boolean;
}

type ToastStore = {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => string;
  removeToast: (id: string) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string) => string;
  showError: (message: string) => string;
  showWarning: (message: string) => string;
  showInfo: (message: string) => string;
};

const TOAST_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

const generateToastId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = generateToastId();

    const toast: ToastItem = {
      id,
      type,
      message,
      createdAt: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-dismiss after fixed duration
    setTimeout(() => {
      get().dismissToast(id);
    }, TOAST_DURATIONS[type]);

    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      ),
    }));

    // Remove after animation completes
    setTimeout(() => {
      get().removeToast(id);
    }, 300);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  showSuccess: (message) => get().addToast("success", message),
  showError: (message) => get().addToast("error", message),
  showWarning: (message) => get().addToast("warning", message),
  showInfo: (message) => get().addToast("info", message),
}));
