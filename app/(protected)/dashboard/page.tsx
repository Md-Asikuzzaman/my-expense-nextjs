import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { Receipt } from 'lucide-react';

import {
  getAnalytics,
  getDashboardSummary,
  getExpenses,
  getSmartInsights,
  getBudgetsForMonth,
  getMonthlyExpenseByCategory,
} from '@/lib/data';
import { parseFilters } from '@/lib/filters';
import { formatCurrency, formatDate } from '@/lib/format';
import { runRecurringAutomation } from '@/lib/recurring';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { ChartsSection } from '@/components/dashboard/charts-section';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { ExportPdfButton } from '@/components/dashboard/export-pdf-button';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { BudgetProgress } from '@/components/dashboard/budget-progress';
import { BudgetForm } from '@/components/forms/budget-form';
import { BudgetManager } from '@/components/forms/budget-manager';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
    <div className='space-y-5 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg sm:text-xl lg:text-2xl font-bold tracking-tight'>
            Dashboard
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Overview of your finances
          </p>
        </div>
      </div>

      <FilterBar />

      {/* Overview Cards */}
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <SummarySection />
      </Suspense>

      {/* Insights */}
      <Suspense fallback={<InsightsSkeleton />}>
        <InsightsSection />
      </Suspense>

      {/* Transactions & Budget Grid */}
      <section className='grid gap-4 lg:grid-cols-[2fr_1fr] xl:grid-cols-[3fr_1fr]'>
        {/* Transactions */}
        <Card id='transactions' className='w-full overflow-hidden'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base sm:text-lg'>
                  Recent Transactions
                </CardTitle>
                <CardDescription className='text-xs sm:text-sm mt-1'>
                  Showing {expenses.length} result
                  {expenses.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-2 px-3 sm:px-6'>
            {expenses.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Receipt className='size-10 text-muted-foreground/50 mb-3' />
                <p className='text-sm text-muted-foreground'>
                  No transactions found
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Add your first transaction using the button below
                </p>
              </div>
            ) : (
              expenses.slice(0, 12).map((item) => (
                <Link
                  key={item.id}
                  href={`/transactions/${item.id}`}
                  className={cn(
                    'group flex flex-col gap-2 rounded-xl border border-border/60 p-3 sm:p-4',
                    'hover:bg-accent/50 hover:border-accent/50 transition-all duration-200',
                    'sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3',
                  )}
                >
                  <div className='min-w-0'>
                    <p className='font-medium text-sm sm:text-base truncate'>
                      {item.title}
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {formatDate(item.date)} • {item.category}
                    </p>
                  </div>
                  <div className='flex items-center justify-between gap-3 sm:contents'>
                    <Badge variant='outline' className='w-fit text-xs shrink-0'>
                      {item.type}
                    </Badge>
                    <p
                      className={cn(
                        'text-right font-medium text-sm sm:text-base shrink-0',
                        item.type === 'EXPENSE'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400',
                      )}
                    >
                      {item.type === 'EXPENSE' ? '-' : '+'}
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Budget Section */}
        <Suspense fallback={<BudgetSkeleton />}>
          <BudgetSection month={month} year={year} />
        </Suspense>
      </section>

      {/* Analytics */}
      <section className='space-y-4'>
        <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
          <div>
            <h3 className='text-base sm:text-lg font-semibold'>
              Analytics & Reports
            </h3>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              Track your spending patterns
            </p>
          </div>
          <ExportPdfButton filters={plainFilters} />
        </div>
        <Suspense fallback={<AnalyticsSkeleton />}>
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
    <div className='space-y-3'>
      <ChartsSection
        categoryTotals={analytics.categoryTotals}
        monthlyCategoryTrend={analytics.monthlyCategoryTrend}
      />
      <Card>
        <CardContent className='flex items-center justify-between pt-4 text-sm'>
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
    <div className='space-y-4'>
      <BudgetProgress budgets={budgets} spentByCategory={spentByCategory} />
      <Card>
        <CardHeader>
          <CardTitle>Set Budget</CardTitle>
          <CardDescription>Monthly and category budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm month={month} year={year} />
          <div className='mt-4 border-t border-border/70 pt-4'>
            <BudgetManager budgets={budgets} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton Components
function OverviewCardsSkeleton() {
  return (
    <div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className='rounded-2xl border border-border/60 p-4 sm:p-5 shadow-sm'
        >
          <div className='flex items-center justify-between mb-3'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-5 w-5 rounded-full' />
          </div>
          <Skeleton className='h-8 sm:h-10 w-32 mb-2' />
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-32' />
      </CardHeader>
      <CardContent className='space-y-2'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-12 w-full rounded-lg' />
        ))}
      </CardContent>
    </Card>
  );
}

function BudgetSkeleton() {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='space-y-2'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-24' />
              </div>
              <Skeleton className='h-2 w-full' />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-24' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Skeleton className='h-11 w-full' />
            <Skeleton className='h-11 w-full' />
          </div>
          <Skeleton className='h-11 w-full' />
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-4 w-24' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-4 w-28' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-64 w-full' />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className='py-4'>
          <div className='flex justify-between'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-4 w-40' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
