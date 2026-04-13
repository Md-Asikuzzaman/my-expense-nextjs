"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertBudgetAction } from "@/app/actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import {
  BudgetFormInput,
  BudgetFormValues,
  budgetFormSchema,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BudgetForm({ month, year }: { month: number; year: number }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<BudgetFormInput, unknown, BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "Food",
      limit: 0,
      month,
      year,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertBudgetAction(values);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Budget saved.");
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-4 gap-2">
      <div className="col-span-2 grid gap-2">
        <Label htmlFor="budget-category">Category</Label>
        <select
          id="budget-category"
          className="h-9 rounded-lg border border-input bg-background px-3"
          {...form.register("category")}
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2 grid gap-2">
        <Label htmlFor="budget-limit">Limit</Label>
        <Input
          id="budget-limit"
          type="number"
          step="0.01"
          {...form.register("limit")}
        />
      </div>

      <input type="hidden" {...form.register("month")} />
      <input type="hidden" {...form.register("year")} />

      <div className="col-span-4">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Set Budget"}
        </Button>
      </div>
    </form>
  );
}
