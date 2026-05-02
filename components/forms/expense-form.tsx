"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, Controller } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, Repeat } from "lucide-react";

import { createExpenseAction, updateExpenseAction } from "@/app/actions";
import { EXPENSE_TYPES, RECURRENCE_TYPES } from "@/lib/constants";
import {
  ExpenseFormInput,
  ExpenseFormValues,
  expenseFormSchema,
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Props = {
  expenseId?: string;
  initialValues?: Partial<ExpenseFormValues>;
  categories: string[];
  onSuccess?: () => void;
};

export function ExpenseForm({
  expenseId,
  initialValues,
  categories,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const categoryOptions = Array.from(
    new Set(
      initialValues?.category
        ? [...categories, initialValues.category]
        : categories,
    ),
  );

  const defaultCategory =
    initialValues?.category ?? categoryOptions[0] ?? "Uncategorized";
  const hasCategories = categoryOptions.length > 0;

  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      amount: initialValues?.amount ?? 0,
      type: initialValues?.type ?? "EXPENSE",
      category: defaultCategory,
      note: initialValues?.note ?? "",
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
      isRecurring: initialValues?.isRecurring ?? false,
      recurrence: initialValues?.recurrence,
    },
  });

  const isRecurring = useWatch({ control: form.control, name: "isRecurring" });
  const errors = form.formState.errors;

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
          category: defaultCategory,
          note: "",
          date: new Date().toISOString().slice(0, 10),
          isRecurring: false,
        });
      }
      onSuccess?.();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Title */}
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., Grocery shopping"
          className={cn(
            "h-11 sm:h-10",
            errors.title && "border-destructive focus-visible:ring-destructive",
          )}
          {...form.register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Amount & Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            className={cn(
              "h-11 sm:h-10",
              errors.amount &&
                "border-destructive focus-visible:ring-destructive",
            )}
            {...form.register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              className={cn(
                "h-11 sm:h-10 pr-10",
                errors.date &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              {...form.register("date")}
            />
            <CalendarIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Type & Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 sm:h-10 w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
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
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!hasCategories && (
                <p className="text-xs text-muted-foreground">
                  Create a category first from the Categories page.
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Note */}
      <div className="grid gap-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Input
          id="note"
          placeholder="Add a note..."
          className="h-11 sm:h-10"
          {...form.register("note")}
        />
      </div>

      {/* Recurring Checkbox */}
      <Controller
        name="isRecurring"
        control={form.control}
        render={({ field }) => (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="isRecurring"
            />
            <div className="flex items-center gap-2">
              <Repeat className="size-4 text-muted-foreground" />
              <Label
                htmlFor="isRecurring"
                className="text-sm font-normal cursor-pointer"
              >
                Mark as recurring transaction
              </Label>
            </div>
          </div>
        )}
      />

      {/* Recurrence Select (conditional) */}
      <AnimatePresence>
        {isRecurring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Controller
              name="recurrence"
              control={form.control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label>Recurrence Pattern</Label>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-11 sm:h-10 w-full">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_TYPES.map((recurrence) => (
                        <SelectItem key={recurrence} value={recurrence}>
                          {recurrence}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={isPending || !hasCategories}
          className="w-full h-11 sm:h-10 text-base sm:text-sm"
        >
          {!hasCategories
            ? "Create categories first"
            : isPending
              ? "Saving..."
              : expenseId
                ? "Update Transaction"
                : "Add Transaction"}
        </Button>
      </motion.div>
    </form>
  );
}
