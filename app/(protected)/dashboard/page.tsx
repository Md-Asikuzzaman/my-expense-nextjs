import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Receipt } from "lucide-react";

import {
  getAnalytics,
  getCategories,
  getDashboardSummary,
  getExpenses,
  hasActiveFilters,
  getSmartInsights,
  getBudgetsForMonth,
  getMonthlyExpenseByCategory,
} from "@/lib/data";
import { parseFilters } from "@/lib/filters";
import { formatCurrency, formatDate } from "@/lib/format";
import { runRecurringAutomation } from "@/lib/recurring";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ExportPdfButton } from "@/components/dashboard/export-pdf-button";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { BudgetForm } from "@/components/forms/budget-form";
import { BudgetManager } from "@/components/forms/budget-manager";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  await runRecurringAutomation();
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [expenses, categories] = await Promise.all([
    getExpenses(filters),
    getCategories(),
  ]);

  const currentPage = Math.max(
    1,
    Number.parseInt(
      Array.isArray(resolvedSearchParams.page)
        ? resolvedSearchParams.page[0] || "1"
        : resolvedSearchParams.page || "1",
      10,
    ) || 1,
  );
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(expenses.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedExpenses = expenses.slice(start, end);
  const categoryNames = categories.map((item) => item.name);

  const plainFilters = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your finances
          </p>
        </div>
      </div>

      <FilterBar categories={categoryNames} />

      {/* Overview Cards */}
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <SummarySection filters={filters} />
      </Suspense>

      {/* Analytics */}
      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">
              Analytics & Reports
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Track your spending patterns
            </p>
          </div>
          <ExportPdfButton filters={plainFilters} />
        </div>
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsSection />
        </Suspense>
      </section>

      {/* Transactions & Budget Grid */}
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr] xl:grid-cols-[3fr_1fr]">
        {/* Transactions */}
        <Card id="transactions" className="w-full overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Showing {expenses.length === 0 ? 0 : start + 1}-
                  {Math.min(end, expenses.length)} of {expenses.length} result
                  {expenses.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-3 sm:px-6">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No transactions found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add your first transaction using the button below
                </p>
              </div>
            ) : (
              paginatedExpenses.map((item) => (
                <Link
                  key={item.id}
                  href={`/transactions/${item.id}`}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border border-border/60 p-3 sm:p-4",
                    "hover:bg-accent/50 hover:border-accent/50 transition-all duration-200",
                    "sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3",
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(item.date)} • {item.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:contents">
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="w-fit text-xs">
                        {item.type}
                      </Badge>
                      {item.isRecurring && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-right font-medium text-sm sm:text-base shrink-0",
                        item.type === "EXPENSE"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {item.type === "EXPENSE" ? "-" : "+"}
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </Link>
              ))
            )}

            {expenses.length > pageSize && (
              <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
                <Link
                  href={buildPageLink(
                    resolvedSearchParams,
                    Math.max(safePage - 1, 1),
                  )}
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs sm:text-sm transition-colors",
                    safePage === 1
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent",
                  )}
                >
                  Previous
                </Link>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Page {safePage} of {totalPages}
                </p>
                <Link
                  href={buildPageLink(
                    resolvedSearchParams,
                    Math.min(safePage + 1, totalPages),
                  )}
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs sm:text-sm transition-colors",
                    safePage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-accent",
                  )}
                >
                  Next
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Section */}
        <Suspense fallback={<BudgetSkeleton />}>
          <BudgetSection month={month} year={year} categories={categoryNames} />
        </Suspense>
      </section>

      {/* Bottom Insights */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<InsightsSkeleton />}>
          <InsightsSection />
        </Suspense>
        <Suspense fallback={<CategorySummarySkeleton />}>
          <CategorySummarySection />
        </Suspense>
      </section>
    </div>
  );
}

async function SummarySection({
  filters,
}: {
  filters: ReturnType<typeof parseFilters>;
}) {
  const summary = await getDashboardSummary(
    hasActiveFilters(filters) ? filters : undefined,
  );
  return <OverviewCards {...summary} />;
}

async function AnalyticsSection() {
  const analytics = await getAnalytics();
  return (
    <ChartsSection
      categoryTotals={analytics.categoryTotals}
      monthlyCategoryTrend={analytics.monthlyCategoryTrend}
      monthlyFinanceTrend={analytics.monthlyFinanceTrend}
      categoryColors={analytics.categoryColors}
    />
  );
}

async function CategorySummarySection() {
  const analytics = await getAnalytics();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Spending Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          Top spending category: <strong>{analytics.topCategory}</strong>
        </p>
        <p>
          Least spending category: <strong>{analytics.leastCategory}</strong>
        </p>
      </CardContent>
    </Card>
  );
}

async function InsightsSection() {
  const insights = await getSmartInsights();
  return <InsightsPanel insights={insights} />;
}

async function BudgetSection({
  month,
  year,
  categories,
}: {
  month: number;
  year: number;
  categories: string[];
}) {
  const [budgets, spentByCategory] = await Promise.all([
    getBudgetsForMonth(month, year),
    getMonthlyExpenseByCategory(month, year),
  ]);

  return (
    <div className="space-y-4">
      <BudgetProgress budgets={budgets} spentByCategory={spentByCategory} />
      <Card>
        <CardHeader>
          <CardTitle>Set Budget</CardTitle>
          <CardDescription>Monthly and category budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm month={month} year={year} categories={categories} />
          <div className="mt-4 border-t border-border/70 pt-4">
            <BudgetManager budgets={budgets} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildPageLink(
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;

    const single = Array.isArray(value) ? value[0] : value;
    if (single) {
      params.set(key, single);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

// Skeleton Components
function OverviewCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/60 p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 sm:h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

function CategorySummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-4 w-52" />
      </CardContent>
    </Card>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
