import {
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Growth({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        positive ? "text-emerald-600" : "text-rose-600",
      )}
    >
      {positive ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function OverviewCards({
  currentIncome,
  currentExpense,
  savings,
  incomeGrowth,
  expenseGrowth,
  savingsGrowth,
}: {
  currentIncome: number;
  currentExpense: number;
  savings: number;
  incomeGrowth: number;
  expenseGrowth: number;
  savingsGrowth: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="w-full bg-gradient-to-br from-emerald-500/10 to-emerald-400/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Total Income
            <ArrowUpCircle className="size-4 text-emerald-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(currentIncome)}
          </div>
          <Growth value={incomeGrowth} />
        </CardContent>
      </Card>

      <Card className="w-full bg-gradient-to-br from-rose-500/10 to-rose-400/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Total Expense
            <ArrowDownCircle className="size-4 text-rose-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(currentExpense)}
          </div>
          <Growth value={expenseGrowth} />
        </CardContent>
      </Card>

      <Card className="w-full sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-500/10 to-violet-500/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Savings
            <Wallet className="size-4 text-indigo-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold">{formatCurrency(savings)}</div>
          <Growth value={savingsGrowth} />
        </CardContent>
      </Card>
    </div>
  );
}
