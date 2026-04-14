import "server-only";

import {
  endOfMonth,
  format,
  isValid,
  startOfMonth,
  subMonths,
  eachMonthOfInterval,
} from "date-fns";
import { cacheLife, cacheTag } from "next/cache";

import prisma from "@/lib/prisma";
import {
  DEFAULT_CATEGORY_SEEDS,
  getFallbackCategoryColor,
} from "@/lib/categories";
import { ParsedFilters } from "@/lib/filters";

function sanitizeDate(date?: Date) {
  if (!date || !isValid(date)) {
    return undefined;
  }
  return date;
}

function growthPercentage(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

function buildExpenseWhere(filters: ParsedFilters = {}) {
  const where: {
    date?: { gte?: Date; lte?: Date };
    category?: string;
    type?: "INCOME" | "EXPENSE";
    amount?: { gte?: number; lte?: number };
  } = {};

  const start = sanitizeDate(filters.startDate);
  const end = sanitizeDate(filters.endDate);

  if (start || end) {
    where.date = {
      ...(start ? { gte: start } : {}),
      ...(end ? { lte: end } : {}),
    };
  }

  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;
  if (filters.minAmount || filters.maxAmount) {
    where.amount = {
      ...(typeof filters.minAmount === "number"
        ? { gte: filters.minAmount }
        : {}),
      ...(typeof filters.maxAmount === "number"
        ? { lte: filters.maxAmount }
        : {}),
    };
  }

  return where;
}

export function hasActiveFilters(filters: ParsedFilters = {}) {
  return Boolean(
    filters.startDate ||
    filters.endDate ||
    filters.category ||
    filters.type ||
    typeof filters.minAmount === "number" ||
    typeof filters.maxAmount === "number",
  );
}

async function ensureDefaultCategories() {
  const count = await prisma.category.count();
  if (count > 0) {
    return;
  }

  for (const item of DEFAULT_CATEGORY_SEEDS) {
    await prisma.category.upsert({
      where: { name: item.name },
      create: {
        name: item.name,
        color: item.color,
      },
      update: {},
    });
  }
}

async function getDefaultDashboardSummary() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");

  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  const [current, previous] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: currentStart, lte: currentEnd } },
    }),
    prisma.expense.findMany({
      where: { date: { gte: prevStart, lte: prevEnd } },
    }),
  ]);

  const currentIncome = current
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);
  const currentExpense = current
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);
  const previousIncome = previous
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);
  const previousExpense = previous
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    currentIncome,
    currentExpense,
    savings: currentIncome - currentExpense,
    incomeGrowth: growthPercentage(currentIncome, previousIncome),
    expenseGrowth: growthPercentage(currentExpense, previousExpense),
    savingsGrowth: growthPercentage(
      currentIncome - currentExpense,
      previousIncome - previousExpense,
    ),
  };
}

export async function getCategories() {
  "use cache";
  cacheLife("days");
  cacheTag("categories");

  await ensureDefaultCategories();

  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoriesWithUsage() {
  const categories = await getCategories();
  const usage = await Promise.all(
    categories.map(async (category) => {
      const [expenseCount, budgetCount] = await Promise.all([
        prisma.expense.count({ where: { category: category.name } }),
        prisma.budget.count({ where: { category: category.name } }),
      ]);
      return {
        ...category,
        expenseCount,
        budgetCount,
      };
    }),
  );

  return usage;
}

export async function getDashboardSummary(filters?: ParsedFilters) {
  const activeFilters = hasActiveFilters(filters);

  if (activeFilters) {
    const filtered = await prisma.expense.findMany({
      where: buildExpenseWhere(filters),
    });

    const currentIncome = filtered
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + item.amount, 0);
    const currentExpense = filtered
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      currentIncome,
      currentExpense,
      savings: currentIncome - currentExpense,
      incomeGrowth: 0,
      expenseGrowth: 0,
      savingsGrowth: 0,
    };
  }

  return getDefaultDashboardSummary();
}

export async function getAnalytics() {
  "use cache";
  cacheLife("minutes");
  cacheTag("analytics");

  const now = new Date();
  const months = eachMonthOfInterval({
    start: startOfMonth(subMonths(now, 5)),
    end: startOfMonth(now),
  });

  const categories = await getCategories();
  const categoryNames = categories.map((item) => item.name);

  const records = await prisma.expense.findMany({
    where: {
      type: "EXPENSE",
      date: {
        gte: startOfMonth(subMonths(now, 5)),
        lte: endOfMonth(now),
      },
    },
  });

  const financeRecords = await prisma.expense.findMany({
    where: {
      date: {
        gte: startOfMonth(subMonths(now, 5)),
        lte: endOfMonth(now),
      },
    },
  });

  const categoryTotals = categoryNames.map((category) => ({
    category,
    value: records
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0),
  }));

  const monthlyCategoryTrend = months.map((monthDate) => {
    const key = format(monthDate, "MMM");
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const monthRecords = records.filter(
      (item) => item.date >= start && item.date <= end,
    );

    return categoryNames.reduce(
      (acc, category) => {
        const total = monthRecords
          .filter((item) => item.category === category)
          .reduce((sum, item) => sum + item.amount, 0);
        return { ...acc, [category]: total };
      },
      { month: key } as Record<string, string | number>,
    );
  });

  const monthlyFinanceTrend = months.map((monthDate) => {
    const key = format(monthDate, "MMM");
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const monthRecords = financeRecords.filter(
      (item) => item.date >= start && item.date <= end,
    );

    const income = monthRecords
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = monthRecords
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      month: key,
      income,
      expense,
      net: income - expense,
    };
  });

  const sorted = [...categoryTotals].sort((a, b) => b.value - a.value);

  const categoryColors = Object.fromEntries(
    categories.map((category, index) => [
      category.name,
      category.color || getFallbackCategoryColor(index),
    ]),
  );

  return {
    categoryTotals,
    monthlyCategoryTrend,
    monthlyFinanceTrend,
    categoryColors,
    topCategory: sorted.find((item) => item.value > 0)?.category ?? "None",
    leastCategory:
      [...sorted].reverse().find((item) => item.value > 0)?.category ?? "None",
  };
}

export async function getBudgetsForMonth(month: number, year: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("budgets");

  return prisma.budget.findMany({
    where: {
      month,
      year,
    },
    orderBy: { category: "asc" },
  });
}

export async function getMonthlyExpenseByCategory(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const expenses = await prisma.expense.findMany({
    where: {
      type: "EXPENSE",
      date: { gte: start, lte: end },
    },
  });

  return expenses.reduce<Record<string, number>>((acc, item) => {
    return { ...acc, [item.category]: (acc[item.category] ?? 0) + item.amount };
  }, {});
}

export async function getExpenses(filters: ParsedFilters = {}) {
  return prisma.expense.findMany({
    where: buildExpenseWhere(filters),
    orderBy: [{ createdAt: "desc" }, { date: "desc" }],
  });
}

export async function getExpenseById(id: string) {
  return prisma.expense.findUnique({ where: { id } });
}

export async function getSmartInsights() {
  const categories = await getCategories();

  const now = new Date();
  const startCurrent = startOfMonth(now);
  const endCurrent = endOfMonth(now);
  const startPrev = startOfMonth(subMonths(now, 1));
  const endPrev = endOfMonth(subMonths(now, 1));

  const [current, previous] = await Promise.all([
    prisma.expense.findMany({
      where: {
        type: "EXPENSE",
        date: { gte: startCurrent, lte: endCurrent },
      },
    }),
    prisma.expense.findMany({
      where: {
        type: "EXPENSE",
        date: { gte: startPrev, lte: endPrev },
      },
    }),
  ]);

  const insights: string[] = [];

  for (const category of categories.map((item) => item.name)) {
    const currentTotal = current
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
    const prevTotal = previous
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);

    if (prevTotal > 0 && currentTotal > prevTotal) {
      const pct = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
      insights.push(`You spent ${pct}% more on ${category} this month.`);
    }
  }

  const byDay = current.reduce<Record<string, number>>((acc, item) => {
    const day = format(item.date, "EEEE");
    return { ...acc, [day]: (acc[day] ?? 0) + item.amount };
  }, {});

  const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  if (topDay) {
    insights.push(`Your highest spending day is ${topDay[0]}.`);
  }

  if (!insights.length) {
    insights.push("Your spending is stable this month. Keep the momentum.");
  }

  return insights.slice(0, 4);
}
