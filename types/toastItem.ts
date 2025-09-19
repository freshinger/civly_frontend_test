import { ToastType } from "./toastType";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
  isExiting?: boolean;
}
