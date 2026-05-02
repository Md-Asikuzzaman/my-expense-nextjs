"use client";

import { create } from "zustand";

type QuickAddState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useQuickAddStore = create<QuickAddState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
