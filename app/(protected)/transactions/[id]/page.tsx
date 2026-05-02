import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  Clock,
  Edit3,
  Receipt,
} from "lucide-react";
import Link from "next/link";

import { getCategories, getExpenseById } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "@/components/forms/expense-form";
import { DeleteExpenseButton } from "@/components/dashboard/delete-expense-button";

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionContent params={params} />
    </Suspense>
  );
}

async function TransactionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [transaction, categories] = await Promise.all([
    getExpenseById(id),
    getCategories(),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard#transactions">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Transaction Details
          </h2>
          <p className="text-sm text-muted-foreground">
            View and manage your transaction
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Transaction Details Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  transaction.type === "EXPENSE"
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                )}
              >
                <Receipt className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">
                  {transaction.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {transaction.type} • {transaction.category}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Amount */}
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p
                className={cn(
                  "text-2xl sm:text-3xl font-bold tracking-tight",
                  transaction.type === "EXPENSE"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {transaction.type === "EXPENSE" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <Tag className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{transaction.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <Receipt className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Note */}
            {transaction.note && (
              <div className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Note</p>
                </div>
                <p className="text-sm">{transaction.note}</p>
              </div>
            )}

            {/* Recurring Badge */}
            {transaction.isRecurring && (
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-3">
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                >
                  Recurring
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {transaction.recurrence}
                </span>
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-2">
              <DeleteExpenseButton id={transaction.id} />
            </div>
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Edit3 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Edit Transaction
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update transaction details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ExpenseForm
              expenseId={transaction.id}
              categories={categories.map((item) => item.name)}
              initialValues={{
                title: transaction.title,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                note: transaction.note ?? "",
                date: transaction.date.toISOString().slice(0, 10),
                isRecurring: transaction.isRecurring,
                recurrence: transaction.recurrence ?? undefined,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function TransactionSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-20 rounded-xl bg-muted" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
