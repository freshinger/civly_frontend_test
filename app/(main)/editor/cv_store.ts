// lib/cv-store.ts (only the fetchAll impl shown)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type CvData } from "@/schemas/cv_data_schema";
import {
  fetchAllCvs,
  updateCv,
  deleteCv,
  fetchCv,
} from "@/services/cv_data.service";

const isNewer = (aISO: string, bISO: string) =>
  Date.parse(aISO) > Date.parse(bISO);

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
  isExiting?: boolean;
}

type CvStore = {
  // CV data
  items: CvData[];
  fetchAll: () => Promise<void>;
  saveLocally: (cv: CvData) => void;
  saveRemote: (cv: CvData) => Promise<void>;
  getSingle: (id: string) => Promise<CvData | undefined>;
  deleteOne: (id: string) => Promise<void>;

  // Toast notifications
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => string;
  removeToast: (id: string) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;

  // Toast convenience methods
  showSuccess: (message: string) => string;
  showError: (message: string) => string;
  showWarning: (message: string) => string;
  showInfo: (message: string) => string;
};

// Generate unique ID for toasts
const generateToastId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

// Fixed durations by type (in milliseconds)
const TOAST_DURATIONS: Record<ToastType, number> = {
  success: 3000, // 3s - quick positive feedback
  error: 5000, // 5s - more time to read errors
  warning: 4000, // 4s - moderate attention needed
  info: 3000, // 3s - neutral information
};

export const useCvStore = create<CvStore>()(
  persist(
    (set, get) => ({
      // CV state
      items: [],

      // Toast state
      toasts: [],

      // Merge policy: last-write-wins per CV (server vs local)
      fetchAll: async () => {
        const server = await fetchAllCvs();
        const local = get().items;

        // index locals by id for O(1) lookups
        const localById = new Map(local.map((cv) => [cv.id, cv]));
        const nextById = new Map(localById); // start from local

        for (const s of server) {
          const l = localById.get(s.id);
          if (!l) {
            // only on server -> add it
            nextById.set(s.id, s);
          } else {
            // both exist -> replace only if server is newer
            if (!s.updatedAt || !l.updatedAt) {
              nextById.set(s.id, s);
            } else {
              nextById.set(s.id, isNewer(s.updatedAt, l.updatedAt) ? s : l);
            }
          }
        }

        // keep locals that don’t exist on server (e.g., unsynced drafts)
        set({ items: Array.from(nextById.values()) });
      },

      saveLocally: (cv) => {
        console.log("SAVE LOCALLY", cv);
        if (!cv?.id) {
          console.warn("saveLocally: missing id", cv);
          return;
        }
        set((s) => {
          const items = s.items ?? [];
          const idx = items.findIndex((x) => x?.id === cv.id);
          if (idx === -1) return { items: [...items, cv] };

          // merge instead of replace (so partials are OK)
          const next = items.slice();
          next[idx] = {
            ...items[idx],
            ...cv,
            updatedAt: new Date().toISOString(),
          };
          return { items: next };
        });
        console.log("SAVED LOCALLY", get().items);
      },

      saveRemote: async (cv) => {
        await updateCv(cv);
        // after remote save you can either refetch or just mirror locally:
        // Option A (strict): await get().fetchAll()
        // Option B (fast): mirror now; next fetch will reconcile anyway
        set((s) => ({
          items: s.items.some((x) => x.id === cv.id)
            ? s.items.map((x) => (x.id === cv.id ? cv : x))
            : [...s.items, cv],
        }));
      },

      getSingle: async (id) => {
        console.log("GET SINGLE", id);
        await get().fetchReal(id);
        return await Promise.resolve(get().items.find((x) => x?.id === id));
      },

      fetchReal: async (id) => {
        console.log("Fetch Real");
        const real = await fetchCv(id);
        set({ items: [real] });
        console.log("Real fetched: ", get().items);
      },

      deleteOne: async (id) => {
        await deleteCv(id);

        // after server delete, drop it locally too
        // (or call fetchAll() if you want to strictly mirror server)
        set((s) => ({
          items: s.items.filter((cv) => cv.id !== id),
        }));
      },

      // Toast methods
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
        // Start exit animation
        set((state) => ({
          toasts: state.toasts.map((toast) =>
            toast.id === id ? { ...toast, isExiting: true } : toast
          ),
        }));

        // Remove after animation completes
        setTimeout(() => {
          get().removeToast(id);
        }, 300); // Match animation duration
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
    }),

    {
      name: "cv_store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
