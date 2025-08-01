import { create } from "zustand";

export const useSettingsStore = create((set, get) => ({
  menuFixed: false,

  setMenuFixed: (fixed) => set({ menuFixed: fixed }),
}));
