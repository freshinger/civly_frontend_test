import { create } from "zustand";

type ImageStore = {
  images: Record<string, string>;
  setImage: (id: string, url: string) => void;
  getImage: (id: string) => string | undefined;
  removeImage: (id: string) => void;
};

export const useImageStore = create<ImageStore>((set, get) => ({
  images: {},

  setImage: (id, url) =>
    set((state) => ({
      images: {
        ...state.images,
        [id]: url,
      },
    })),

  getImage: (id) => get().images[id],

  removeImage: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.images;
      return { images: rest };
    }),
}));
