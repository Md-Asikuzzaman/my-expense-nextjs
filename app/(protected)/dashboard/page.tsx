import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

import {
  getAnalytics,
  getDashboardSummary,
  getExpenses,
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

  const expenses = await getExpenses(filters);

  const plainFilters = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold sm:text-2xl">
          Finance Command Center
        </h2>
      </div>

      <FilterBar />

      <Suspense
        fallback={
          <Card>
            <CardContent>Loading summary...</CardContent>
          </Card>
        }
      >
        <SummarySection />
      </Suspense>

      <Suspense
        fallback={
          <Card className="w-full">
            <CardContent>Loading insights...</CardContent>
          </Card>
        }
      >
        <InsightsSection />
      </Suspense>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card id="transactions" className="w-full">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Showing {expenses.length} result(s) based on your filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenses.slice(0, 12).map((item) => (
              <Link
                key={item.id}
                href={`/transactions/${item.id}`}
                className="grid gap-3 rounded-xl border border-border/70 p-3 hover:bg-muted/50 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.date)} • {item.category}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 sm:contents">
                  <Badge variant="outline" className="w-fit">
                    {item.type}
                  </Badge>
                  <p
                    className={
                      item.type === "EXPENSE"
                        ? "text-right text-rose-600"
                        : "text-right text-emerald-600"
                    }
                  >
                    {item.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Suspense
          fallback={
            <Card>
              <CardContent>Loading budgets...</CardContent>
            </Card>
          }
        >
          <BudgetSection month={month} year={year} />
        </Suspense>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold">Analytics & Reports</h3>
          <ExportPdfButton filters={plainFilters} />
        </div>
        <Suspense
          fallback={
            <Card>
              <CardContent>Loading analytics...</CardContent>
            </Card>
          }
        >
          <AnalyticsSection />
        </Suspense>
      </section>
    </div>
  );
}

async function SummarySection() {
  const summary = await getDashboardSummary();
  return <OverviewCards {...summary} />;
}

async function AnalyticsSection() {
  const analytics = await getAnalytics();
  return (
    <div className="space-y-3">
      <ChartsSection
        categoryTotals={analytics.categoryTotals}
        monthlyCategoryTrend={analytics.monthlyCategoryTrend}
      />
      <Card>
        <CardContent className="flex items-center justify-between pt-4 text-sm">
          <span>
            Top spending category: <strong>{analytics.topCategory}</strong>
          </span>
          <span>
            Least spending category: <strong>{analytics.leastCategory}</strong>
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

async function InsightsSection() {
  const insights = await getSmartInsights();
  return <InsightsPanel insights={insights} />;
}

async function BudgetSection({ month, year }: { month: number; year: number }) {
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
          <BudgetForm month={month} year={year} />
          <div className="mt-4 border-t border-border/70 pt-4">
            <BudgetManager budgets={budgets} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
