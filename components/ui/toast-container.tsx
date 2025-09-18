"use client";

import React, { useState, useEffect } from "react";
import { useToastStore } from "@/stores/toast_store";
import { Toast } from "./toast";

export function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();
  const [enteredToasts, setEnteredToasts] = useState<Set<string>>(new Set());

  // Track when toasts enter to trigger entrance animation
  useEffect(() => {
    const newToastIds = toasts
      .filter((toast) => !toast.isExiting)
      .map((toast) => toast.id);

    setEnteredToasts((prev) => {
      const existingIds = new Set(prev);
      const currentToastIds = new Set(newToastIds);

      // Add new toasts that haven't entered yet
      const toAdd = newToastIds.filter((id) => !existingIds.has(id));

      // Remove toasts that no longer exist
      const toKeep = [...prev].filter((id) => currentToastIds.has(id));

      if (toAdd.length > 0) {
        // Start them offscreen, then animate in after a small delay
        setTimeout(() => {
          setEnteredToasts(() => new Set([...toKeep, ...toAdd]));
        }, 10);
      }

      // Return cleaned up set for immediate update
      return new Set(toKeep);
    });
  }, [toasts]); // Only depend on toasts, not enteredToasts

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 flex max-h-screen flex-col space-y-2 overflow-hidden bottom-4 right-4"
      aria-live="polite"
      aria-label="Toast notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`transform transition-transform duration-300 ease-in-out ${
            toast.isExiting
              ? "translate-y-full"
              : enteredToasts.has(toast.id)
                ? "translate-y-0"
                : "translate-y-full"
          }`}
        >
          <Toast toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
