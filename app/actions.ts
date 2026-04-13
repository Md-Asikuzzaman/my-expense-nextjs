"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import {
  createSession,
  clearSession,
  requireAuth,
  verifyStaticCredentials,
} from "@/lib/auth";
import {
  budgetFormSchema,
  expenseFormSchema,
  loginSchema,
} from "@/lib/schemas";
import { parseFilters } from "@/lib/filters";

export async function loginAction(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid credentials.",
    };
  }

  const isValid = verifyStaticCredentials(
    parsed.data.email,
    parsed.data.password,
  );
  if (!isValid) {
    return { ok: false, message: "Invalid login details." };
  }

  await createSession(parsed.data.email);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createExpenseAction(input: {
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: "Food" | "Transport" | "Shopping" | "Bills" | "Others";
  note?: string;
  date: string;
  isRecurring: boolean;
  recurrence?: "DAILY" | "WEEKLY" | "MONTHLY";
}) {
  await requireAuth();

  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const value = parsed.data;
  const date = new Date(value.date);

  await prisma.expense.create({
    data: {
      title: value.title,
      amount: value.amount,
      type: value.type,
      category: value.category,
      note: value.note || null,
      date,
      isRecurring: value.isRecurring,
      recurrence: value.isRecurring ? value.recurrence : null,
      nextRecurringRun: value.isRecurring && value.recurrence ? date : null,
    },
  });

  updateTag("dashboard");
  updateTag("analytics");
  updateTag("expenses");
  return { ok: true };
}

export async function updateExpenseAction(
  id: string,
  input: {
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: "Food" | "Transport" | "Shopping" | "Bills" | "Others";
    note?: string;
    date: string;
    isRecurring: boolean;
    recurrence?: "DAILY" | "WEEKLY" | "MONTHLY";
  },
) {
  await requireAuth();

  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const value = parsed.data;
  const date = new Date(value.date);

  await prisma.expense.update({
    where: { id },
    data: {
      title: value.title,
      amount: value.amount,
      type: value.type,
      category: value.category,
      note: value.note || null,
      date,
      isRecurring: value.isRecurring,
      recurrence: value.isRecurring ? value.recurrence : null,
      nextRecurringRun: value.isRecurring && value.recurrence ? date : null,
    },
  });

  updateTag("dashboard");
  updateTag("analytics");
  updateTag("expenses");
  return { ok: true };
}

export async function deleteExpenseAction(id: string) {
  await requireAuth();

  await prisma.expense.delete({ where: { id } });
  updateTag("dashboard");
  updateTag("analytics");
  updateTag("expenses");
  return { ok: true };
}

export async function upsertBudgetAction(input: {
  category: "Food" | "Transport" | "Shopping" | "Bills" | "Others";
  limit: number;
  month: number;
  year: number;
}) {
  await requireAuth();

  const parsed = budgetFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid budget data.",
    };
  }

  const value = parsed.data;
  const existing = await prisma.budget.findFirst({
    where: {
      category: value.category,
      month: value.month,
      year: value.year,
    },
  });

  if (existing) {
    await prisma.budget.update({
      where: { id: existing.id },
      data: { limit: value.limit },
    });
  } else {
    await prisma.budget.create({
      data: {
        category: value.category,
        limit: value.limit,
        month: value.month,
        year: value.year,
      },
    });
  }

  updateTag("budgets");
  updateTag("dashboard");
  return { ok: true };
}

export async function deleteBudgetAction(id: string) {
  await requireAuth();

  await prisma.budget.delete({ where: { id } });
  updateTag("budgets");
  updateTag("dashboard");
  return { ok: true };
}

export async function exportPdfDataAction(
  rawFilters: Record<string, string | undefined>,
) {
  await requireAuth();
  const filters = parseFilters(rawFilters);

  const expenses = await prisma.expense.findMany({
    where: {
      ...(filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {}),
            },
          }
        : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(typeof filters.minAmount === "number" ||
      typeof filters.maxAmount === "number"
        ? {
            amount: {
              ...(typeof filters.minAmount === "number"
                ? { gte: filters.minAmount }
                : {}),
              ...(typeof filters.maxAmount === "number"
                ? { lte: filters.maxAmount }
                : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
  });

  return expenses.map((item) => ({
    id: item.id,
    title: item.title,
    amount: item.amount,
    type: item.type,
    category: item.category,
    date: item.date.toISOString(),
  }));
}
