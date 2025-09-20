import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { type CvData } from "@/schemas/cv_data_schema";
import {
  updateCv,
  deleteCv,
  fetchCv,
  fetchAllCvsList,
  duplicateCv,
} from "@/services/cv_data.service";

const ts = (s?: string) => (s ? Date.parse(s) : 0) || 0;
const isNewer = (a?: string, b?: string) => ts(a) > ts(b);

type CvStore = {
  items: CvData[];
  fetchAll: () => Promise<CvData[]>;
  saveLocally: (cv: CvData) => void;
  saveName: (cv: CvData) => void;
  saveRemote: (cv: CvData) => Promise<void>;
  getSingle: (id: string) => Promise<CvData | undefined>;
  deleteOne: (id: string) => Promise<void>;
  duplicateOne: (id: string) => Promise<void>;
};

export const useCvStore = create<CvStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Merge policy: last-write-wins per CV (server vs local)
      fetchAll: async () => {
        const server = await fetchAllCvsList();
        set({ items: server });
        return server;
      },
      saveLocally: (cv) => {
        if (!cv?.id) return;
        console.log("SAVE LOCALLY", cv.personalInformation?.name);
        console.log(get().items);

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

      saveName: (cv) => {
        set((s) => {
          const newItems = get().items;
          const idx = newItems.findIndex((x) => x?.id === cv.id);
          newItems[idx].name = cv.name;
          console.log("new items", newItems)
          return { items: newItems };
        });
      },

      getSingle: async (id) => {
        //console.log("GET SINGLE", id);
        const serverData = await fetchCv(id);
        const localData = get().items.find((x) => x?.id === id);

        if (isNewer(serverData.updatedAt, localData?.updatedAt)) {
          get().saveLocally(serverData);
          return serverData;
        }
        return localData;
      },

      saveRemote: async (cv) => {
        return await updateCv(cv);
      },

      deleteOne: async (id) => {
        await deleteCv(id);
        set((s) => ({
          items: s.items.filter((cv) => cv.id !== id),
        }));
      },

      duplicateOne: async (id) => {
        const duplicated = await duplicateCv(id);
        const newItems = get().items;
        newItems.push(duplicated as CvData);
        set((s) => ({
          items: newItems,
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
