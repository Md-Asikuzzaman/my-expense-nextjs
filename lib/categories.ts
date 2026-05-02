export type CategorySeed = {
  name: string;
  color: string;
};

// High-contrast chart colors tuned to stay legible in both light and dark themes.
export const DEFAULT_CATEGORY_SEEDS: CategorySeed[] = [
  { name: "Food", color: "#DC2626" },
  { name: "Transport", color: "#2563EB" },
  { name: "Shopping", color: "#9333EA" },
  { name: "Bills", color: "#EA580C" },
  { name: "Others", color: "#0F766E" },
];

const FALLBACK_COLORS = [
  "#DC2626",
  "#2563EB",
  "#9333EA",
  "#EA580C",
  "#0F766E",
  "#7C3AED",
  "#0891B2",
  "#BE123C",
];

export function getFallbackCategoryColor(index: number) {
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function normalizeHexColor(input: string) {
  const value = input.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    return null;
  }
  return value.toUpperCase();
}
