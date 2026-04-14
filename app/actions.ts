"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { normalizeHexColor } from "@/lib/categories";
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
  category: string;
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
  const categoryExists = await prisma.category.findUnique({
    where: { name: value.category },
    select: { id: true },
  });

  if (!categoryExists) {
    return {
      ok: false,
      message: "Please select a valid category.",
    };
  }

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
    category: string;
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
  const categoryExists = await prisma.category.findUnique({
    where: { name: value.category },
    select: { id: true },
  });

  if (!categoryExists) {
    return {
      ok: false,
      message: "Please select a valid category.",
    };
  }

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
  category: string;
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
  const categoryExists = await prisma.category.findUnique({
    where: { name: value.category },
    select: { id: true },
  });

  if (!categoryExists) {
    return {
      ok: false,
      message: "Please select a valid category.",
    };
  }

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

export async function createCategoryAction(input: {
  name: string;
  color: string;
}) {
  await requireAuth();

  const name = input.name.trim();
  const color = normalizeHexColor(input.color);

  if (!name || name.length > 40) {
    return {
      ok: false,
      message: "Category name must be between 1 and 40 characters.",
    };
  }

  if (!color) {
    return {
      ok: false,
      message: "Color must be a valid hex value (e.g. #2563EB).",
    };
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return { ok: false, message: "Category already exists." };
  }

  await prisma.category.create({
    data: { name, color },
  });

  updateTag("categories");
  updateTag("analytics");
  updateTag("dashboard");
  return { ok: true };
}

export async function updateCategoryAction(
  id: string,
  input: {
    name: string;
    color: string;
  },
) {
  await requireAuth();

  const name = input.name.trim();
  const color = normalizeHexColor(input.color);

  if (!name || name.length > 40) {
    return {
      ok: false,
      message: "Category name must be between 1 and 40 characters.",
    };
  }

  if (!color) {
    return {
      ok: false,
      message: "Color must be a valid hex value (e.g. #2563EB).",
    };
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return { ok: false, message: "Category not found." };
  }

  const duplicate = await prisma.category.findFirst({
    where: {
      name,
      id: { not: id },
    },
  });

  if (duplicate) {
    return { ok: false, message: "Category name already exists." };
  }

  await prisma.category.update({
    where: { id },
    data: { name, color },
  });

  if (category.name !== name) {
    await Promise.all([
      prisma.expense.updateMany({
        where: { category: category.name },
        data: { category: name },
      }),
      prisma.budget.updateMany({
        where: { category: category.name },
        data: { category: name },
      }),
    ]);
  }

  updateTag("categories");
  updateTag("analytics");
  updateTag("dashboard");
  updateTag("expenses");
  updateTag("budgets");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAuth();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return { ok: false, message: "Category not found." };
  }

  const [expenseCount, budgetCount] = await Promise.all([
    prisma.expense.count({ where: { category: category.name } }),
    prisma.budget.count({ where: { category: category.name } }),
  ]);

  if (expenseCount > 0 || budgetCount > 0) {
    return {
      ok: false,
      message:
        "Category is in use by existing expenses or budgets and cannot be deleted.",
    };
  }

  await prisma.category.delete({ where: { id } });

  updateTag("categories");
  updateTag("analytics");
  updateTag("dashboard");
  updateTag("budgets");
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
