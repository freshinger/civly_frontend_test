import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type CvData } from "@/schemas/cv_data_schema";
import {
  updateCv,
  deleteCv,
  fetchCv,
  fetchAll,
  duplicateCv,
  updateCVName,
} from "@/services/cv_data.service";

const ts = (s?: string) => (s ? Date.parse(s) : 0) || 0;
const isNewer = (a?: string, b?: string) => ts(a) > ts(b);

type CvStore = {
  localitems: CvData[];
  remoteitems: CvData[];
  fetchAll: () => Promise<void>;
  saveLocally: (cv: CvData) => void;
  saveRemote: (cv: CvData) => Promise<void>;
  getSingle: (id: string) => Promise<CvData | undefined>;
  duplicateOne: (id: string) => Promise<string>;
  deleteOne: (id: string) => Promise<void>;
  saveName: (cv: CvData) => Promise<void>;
};

export const useCvStore = create<CvStore>()(
  persist(
    (set, get) => ({
      localitems: [],
      remoteitems: [],
      duplicateOne: async (id: string) => {
        return await duplicateCv(id);
      },

      // Merge policy: last-write-wins per CV (server vs local)
      fetchAll: async () => {
        const server = await fetchAll();
        set({ remoteitems: server });
      },

      saveLocally: (cv) => {
        if (!cv?.id) return;
        console.log("SAVE LOCALLY", cv.personalInformation?.name);
        console.log(get().localitems);

        set((s) => {
          const idx = s.localitems.findIndex((x) => x?.id === cv.id);
          if (idx === -1) {
            const withTs: CvData = {
              ...cv,
              updatedAt: cv.updatedAt ?? new Date().toISOString(),
            };
            return { localitems: [...s.localitems, withTs] };
          }

          const current = s.localitems[idx];

          // merge (partials), preserve existing updatedAt
          const next = s.localitems.slice();
          next[idx] = {
            ...current,
            ...cv,
            updatedAt: current.updatedAt,
          };
          return { localitems: next };
        });
      },

      getSingle: async (id) => {
        //console.log("GET SINGLE", id);
        const serverData = await fetchCv(id);
        console.log("SERVER DATA", serverData);
        const localData = get().localitems.find((x) => x?.id === id);
        console.log("LOCAL DATA", localData);
        if (!localData) {
          get().saveLocally(serverData);
          return serverData;
        } else {
          if (isNewer(serverData.updatedAt, localData?.updatedAt)) {
            get().saveLocally(serverData);
            return serverData;
          }
          return localData;
        }
      },

      saveRemote: async (cv) => {
        return await updateCv(cv);
      },

      deleteOne: async (id) => {
        await deleteCv(id);
        set((s) => ({
          localitems: s.localitems.filter((cv) => cv.id !== id),
          remoteitems: s.remoteitems.filter((cv) => cv.id !== id),
        }));
      },
      saveName: async (cv: CvData) => {
        // Update on server
        await updateCVName(cv.id!, cv.name.trim());

        set(() => {
          const newItems = get().remoteitems;
          const idx = newItems.findIndex((x) => x?.id === cv.id);
          newItems[idx].name = cv.name;
          console.log("new items", newItems);
          return { remoteitems: newItems };
        });
      },
    }),

    {
      name: "cv_store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
