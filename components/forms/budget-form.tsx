"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { upsertBudgetAction } from "@/app/actions";
import {
  BudgetFormInput,
  BudgetFormValues,
  budgetFormSchema,
} from "@/lib/schemas";
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
import { cn } from "@/lib/utils";

export function BudgetForm({
  month,
  year,
  categories,
}: {
  month: number;
  year: number;
  categories: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const defaultCategory = useMemo(
    () => categories[0] ?? "Uncategorized",
    [categories],
  );

  const form = useForm<BudgetFormInput, unknown, BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: defaultCategory,
      limit: 0,
      month,
      year,
    },
  });

  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertBudgetAction(values);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Budget saved.");
      form.reset({
        category: defaultCategory,
        limit: 0,
        month,
        year,
      });
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Category & Amount */}
      <div className="grid gap-4">
        <Controller
          name="category"
          control={form.control}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 sm:h-10 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <div className="grid gap-2">
          <Label htmlFor="budget-limit">Budget Limit</Label>
          <Input
            id="budget-limit"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            className={cn(
              "h-11 sm:h-10",
              errors.limit &&
                "border-destructive focus-visible:ring-destructive",
            )}
            {...form.register("limit", { valueAsNumber: true })}
          />
          {errors.limit && (
            <p className="text-xs text-destructive">{errors.limit.message}</p>
          )}
        </div>
      </div>

      <input type="hidden" {...form.register("month")} />
      <input type="hidden" {...form.register("year")} />

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={isPending || categories.length === 0}
          className="w-full h-11 sm:h-10"
        >
          {categories.length === 0
            ? "Create categories first"
            : isPending
              ? "Saving..."
              : "Set Budget"}
        </Button>
      </motion.div>
    </form>
  );
}
