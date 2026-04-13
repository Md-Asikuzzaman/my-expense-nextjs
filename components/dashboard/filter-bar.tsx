"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from "@/lib/constants";
import { useFilterStore } from "@/stores/filter-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { isCollapsed, setCollapsed } = useFilterStore();

  const values = useMemo(
    () => ({
      startDate: params.get("startDate") ?? "",
      endDate: params.get("endDate") ?? "",
      category: params.get("category") ?? "",
      type: params.get("type") ?? "",
      minAmount: params.get("minAmount") ?? "",
      maxAmount: params.get("maxAmount") ?? "",
    }),
    [params],
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.push(`${pathname}?${next.toString()}`);
  };

  const clear = () => router.push(pathname);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Advanced Filters</h3>
        <Button variant="ghost" onClick={() => setCollapsed(!isCollapsed)}>
          {isCollapsed ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronUp className="size-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            type="date"
            value={values.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />
          <Input
            type="date"
            value={values.endDate}
            onChange={(e) => update("endDate", e.target.value)}
          />

          <select
            className="h-9 rounded-lg border border-input bg-background px-3"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-lg border border-input bg-background px-3"
            value={values.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">All types</option>
            {EXPENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Min amount"
            value={values.minAmount}
            onChange={(e) => update("minAmount", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max amount"
            value={values.maxAmount}
            onChange={(e) => update("maxAmount", e.target.value)}
          />

          <Button variant="outline" onClick={clear} className="md:col-span-3">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
