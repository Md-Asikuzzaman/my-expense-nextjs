"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

import { EXPENSE_TYPES } from "@/lib/constants";
import { useFilterStore } from "@/stores/filter-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterBar({ categories }: { categories: string[] }) {
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

  // Count active filters
  const activeFiltersCount = Object.values(values).filter(
    (v) => v && v !== "",
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Advanced Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronUp className="size-4" />
          )}
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Date Range */}
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">
                  From Date
                </Label>
                <Input
                  type="date"
                  className="h-11 sm:h-10"
                  value={values.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input
                  type="date"
                  className="h-11 sm:h-10"
                  value={values.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>

              {/* Category Select */}
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={values.category || ""}
                  onValueChange={(value) => update("category", value || "")}
                >
                  <SelectTrigger className="h-11 sm:h-10 w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Select */}
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select
                  value={values.type || ""}
                  onValueChange={(value) => update("type", value || "")}
                >
                  <SelectTrigger className="h-11 sm:h-10 w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">
                  Min Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="h-11 sm:h-10"
                  placeholder="0.00"
                  value={values.minAmount}
                  onChange={(e) => update("minAmount", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">
                  Max Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="h-11 sm:h-10"
                  placeholder="0.00"
                  value={values.maxAmount}
                  onChange={(e) => update("maxAmount", e.target.value)}
                />
              </div>

              {/* Clear Button */}
              <motion.div
                className="sm:col-span-2 lg:col-span-3"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <Button
                  variant="outline"
                  onClick={clear}
                  className="h-11 sm:h-10 w-full"
                  disabled={activeFiltersCount === 0}
                >
                  Clear all filters
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
