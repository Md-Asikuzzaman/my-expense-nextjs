"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createExpenseAction, updateExpenseAction } from "@/app/actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_TYPES,
  RECURRENCE_TYPES,
} from "@/lib/constants";
import {
  ExpenseFormInput,
  ExpenseFormValues,
  expenseFormSchema,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  expenseId?: string;
  initialValues?: Partial<ExpenseFormValues>;
  onSuccess?: () => void;
};

export function ExpenseForm({ expenseId, initialValues, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      amount: initialValues?.amount ?? 0,
      type: initialValues?.type ?? "EXPENSE",
      category: initialValues?.category ?? "Food",
      note: initialValues?.note ?? "",
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
      isRecurring: initialValues?.isRecurring ?? false,
      recurrence: initialValues?.recurrence,
    },
  });

  const isRecurring = useWatch({ control: form.control, name: "isRecurring" });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = expenseId
        ? await updateExpenseAction(expenseId, values)
        : await createExpenseAction(values);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(
        expenseId ? "Transaction updated." : "Transaction created.",
      );
      if (!expenseId) {
        form.reset({
          title: "",
          amount: 0,
          type: "EXPENSE",
          category: "Food",
          note: "",
          date: new Date().toISOString().slice(0, 10),
          isRecurring: false,
        });
      }
      onSuccess?.();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...form.register("amount")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...form.register("date")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="h-9 rounded-lg border border-input bg-background px-3"
            {...form.register("type")}
          >
            {EXPENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
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
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" {...form.register("note")} />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" {...form.register("isRecurring")} />
        Mark as recurring transaction
      </label>

      {isRecurring && (
        <div className="grid gap-2">
          <Label htmlFor="recurrence">Recurrence</Label>
          <select
            id="recurrence"
            className="h-9 rounded-lg border border-input bg-background px-3"
            {...form.register("recurrence")}
          >
            <option value="">Select recurrence</option>
            {RECURRENCE_TYPES.map((recurrence) => (
              <option key={recurrence} value={recurrence}>
                {recurrence}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : expenseId ? "Update" : "Add Transaction"}
      </Button>
    </form>
  );
}
