import { create } from "zustand";

type SheetStore = {
  navOpen: boolean;
  editorOpen: boolean;

  showNav: () => void;
  hideNav: () => void;

  showEditor: () => void;
  hideEditor: () => void;
};

export const useSheetStore = create<SheetStore>((set) => ({
  navOpen: false,
  editorOpen: false,

  showNav: () => set({ navOpen: true }),
  hideNav: () => set({ navOpen: false }),

  showEditor: () => set({ editorOpen: true }),
  hideEditor: () => set({ editorOpen: false }),
}));
