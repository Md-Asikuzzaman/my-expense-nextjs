"use client";

import { create } from "zustand";

type FilterState = {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  isCollapsed: true,
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
}));
