import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { type CvData } from "@/schemas/cv_data_schema";
import {
  fetchAllCvs,
  updateCv,
  deleteCv,
  fetchCv,
} from "@/services/cv_data.service";

const ts = (s?: string) => (s ? Date.parse(s) : 0) || 0;
const isNewer = (a?: string, b?: string) => ts(a) > ts(b);

type CvStore = {
  items: CvData[];
  fetchAll: () => Promise<void>;
  saveLocally: (cv: CvData) => void;
  saveRemote: (cv: CvData) => Promise<void>;
  getSingle: (id: string) => Promise<CvData | undefined>;
  deleteOne: (id: string) => Promise<void>;
};

export const useCvStore = create<CvStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Merge policy: last-write-wins per CV (server vs local)
      fetchAll: async () => {
        const server = await fetchAllCvs();
        set({ items: server });
      },

      saveLocally: (cv) => {
        if (!cv?.id) return;
        console.log("SAVE LOCALLY", cv.personalInformation?.name);

        set((s) => {
          const idx = s.items.findIndex((x) => x?.id === cv.id);
          if (idx === -1) {
            const withTs: CvData = {
              ...cv,
              updatedAt: cv.updatedAt ?? new Date().toISOString(),
            };
            return { items: [...s.items, withTs] };
          }

          const current = s.items[idx];

          if (isNewer(cv.updatedAt, current.updatedAt)) {
            const next = s.items.slice();
            next[idx] = { ...cv };
            return { items: next };
          }

          // merge (partials), preserve existing updatedAt
          const next = s.items.slice();
          next[idx] = {
            ...current,
            ...cv,
            updatedAt: current.updatedAt,
          };
          return { items: next };
        });
      },

      getSingle: async (id) => {
        console.log("GET SINGLE", id);
        const cvData = await fetchCv(id);
        console.log("SERVER", cvData);
        console.log(
          "LOCAL",
          get().items.find((x) => x?.id === id)
        );

        return cvData;
        /*
        set((s) => {
          const items = s.items ?? [];
          const idx = items.findIndex((x) => x?.id === cvData.id);
          if (idx === -1) return { items: [...items, cvData] };

          // merge instead of replace (so partials are OK)
          const next = items.slice();
          next[idx] = {
            ...items[idx],
            ...cvData,
            updatedAt: new Date().toISOString(),
          };
          return { items: next };
        });
        return await Promise.resolve(get().items.find((x) => x?.id === id));
        */
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

      deleteOne: async (id) => {
        await deleteCv(id);

        // after server delete, drop it locally too
        // (or call fetchAll() if you want to strictly mirror server)
        set((s) => ({
          items: s.items.filter((cv) => cv.id !== id),
        }));
      },
    }),

    {
      name: "cv_store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
