import { create } from "zustand";

export const useSettingsStore = create((set, get) => ({
  menuFixed: false,
  menuBookmarks: [],

  setMenuFixed: (fixed) => set({ menuFixed: fixed }),
  setMenuBookmarks: (bookmarks) => set({ menuBookmarks: bookmarks }),
}));
