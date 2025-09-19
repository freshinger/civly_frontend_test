import { useToastStore } from "@/stores/toast_store";

export function useToast() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  } = useToastStore();

  const toast = {
    success: (message: string) => showSuccess(message),
    error: (message: string) => showError(message),
    warning: (message: string) => showWarning(message),
    info: (message: string) => showInfo(message),
    dismiss: (id: string) => removeToast(id),
    dismissAll: () => clearAllToasts(),
  };

  return { toast };
}
