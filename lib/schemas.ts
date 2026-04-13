import { z } from "zod";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_TYPES,
  RECURRENCE_TYPES,
} from "@/lib/constants";

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(4, "Password is too short."),
});

export const expenseFormSchema = z
  .object({
    title: z.string().min(2, "Title is required."),
    amount: z.coerce.number().positive("Amount must be greater than zero."),
    type: z.enum(EXPENSE_TYPES),
    category: z.enum(EXPENSE_CATEGORIES),
    note: z.string().max(240).optional().or(z.literal("")),
    date: z.string().min(1, "Date is required."),
    isRecurring: z.boolean().default(false),
    recurrence: z.enum(RECURRENCE_TYPES).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.isRecurring && !value.recurrence) {
      ctx.addIssue({
        code: "custom",
        path: ["recurrence"],
        message: "Pick a recurring schedule.",
      });
    }
  });

export const budgetFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  limit: z.coerce.number().positive("Budget must be greater than zero."),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export const filterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  type: z.enum(EXPENSE_TYPES).optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
export type BudgetFormInput = z.input<typeof budgetFormSchema>;
export type BudgetFormValues = z.output<typeof budgetFormSchema>;
export type FilterValues = z.output<typeof filterSchema>;
