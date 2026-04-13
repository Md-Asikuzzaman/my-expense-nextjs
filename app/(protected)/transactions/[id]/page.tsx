import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getExpenseById } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ExpenseForm } from "@/components/forms/expense-form";
import { DeleteExpenseButton } from "@/components/dashboard/delete-expense-button";

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border/70 bg-card p-6">
          Loading transaction...
        </div>
      }
    >
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
  const transaction = await getExpenseById(id);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Full transaction info and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Title:</strong> {transaction.title}
          </p>
          <p>
            <strong>Amount:</strong> {formatCurrency(transaction.amount)}
          </p>
          <p>
            <strong>Type:</strong> {transaction.type}
          </p>
          <p>
            <strong>Category:</strong> {transaction.category}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(transaction.date)}
          </p>
          <p>
            <strong>Created:</strong> {formatDate(transaction.createdAt)}
          </p>
          {transaction.note && (
            <p>
              <strong>Note:</strong> {transaction.note}
            </p>
          )}
          <DeleteExpenseButton id={transaction.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            expenseId={transaction.id}
            initialValues={{
              title: transaction.title,
              amount: transaction.amount,
              type: transaction.type,
              category: transaction.category as
                | "Food"
                | "Transport"
                | "Shopping"
                | "Bills"
                | "Others",
              note: transaction.note ?? "",
              date: transaction.date.toISOString().slice(0, 10),
              isRecurring: transaction.isRecurring,
              recurrence: transaction.recurrence ?? undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
