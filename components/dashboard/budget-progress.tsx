import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type BudgetItem = {
  category: string;
  limit: number;
};

export function BudgetProgress({
  budgets,
  spentByCategory,
}: {
  budgets: BudgetItem[];
  spentByCategory: Record<string, number>;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No budget set for this month yet.
          </p>
        )}

        {budgets.map((budget) => {
          const spent = spentByCategory[budget.category] ?? 0;
          const pct = Math.min((spent / budget.limit) * 100, 100);
          const alert = pct >= 100 ? "danger" : pct >= 80 ? "warn" : "safe";

          return (
            <div key={budget.category} className="space-y-1">
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span>{budget.category}</span>
                <span>
                  {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              {alert !== "safe" && (
                <p
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    alert === "danger" ? "text-rose-600" : "text-amber-600",
                  )}
                >
                  <AlertTriangle className="size-3" />
                  {alert === "danger"
                    ? "Budget limit reached"
                    : "Budget is above 80%"}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
