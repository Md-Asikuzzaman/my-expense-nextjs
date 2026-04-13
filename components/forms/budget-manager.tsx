"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteBudgetAction, upsertBudgetAction } from "@/app/actions";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BudgetItem = {
  id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
};

export function BudgetManager({ budgets }: { budgets: BudgetItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedLimit, setEditedLimit] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const startEdit = (budget: BudgetItem) => {
    setEditingId(budget.id);
    setEditedLimit(String(budget.limit));
  };

  const saveEdit = (budget: BudgetItem) => {
    startTransition(async () => {
      const result = await upsertBudgetAction({
        category: budget.category as
          | "Food"
          | "Transport"
          | "Shopping"
          | "Bills"
          | "Others",
        limit: Number(editedLimit),
        month: budget.month,
        year: budget.year,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Budget updated.");
      setEditingId(null);
      setEditedLimit("");
      router.refresh();
    });
  };

  const removeBudget = (id: string) => {
    startTransition(async () => {
      const result = await deleteBudgetAction(id);
      if (!result.ok) {
        toast.error("Could not delete budget.");
        return;
      }
      toast.success("Budget deleted.");
      router.refresh();
    });
  };

  if (!budgets.length) {
    return (
      <p className="text-sm text-muted-foreground">No budget entries yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {budgets.map((budget) => {
        const isEditing = editingId === budget.id;

        return (
          <div
            key={budget.id}
            className="flex flex-col gap-3 rounded-lg border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{budget.category}</p>
              {!isEditing && (
                <p className="text-xs text-muted-foreground">
                  Limit: {formatCurrency(budget.limit)}
                </p>
              )}
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {isEditing ? (
                <>
                  <Input
                    className="h-9 w-full sm:w-28"
                    type="number"
                    step="0.01"
                    value={editedLimit}
                    onChange={(event) => setEditedLimit(event.target.value)}
                  />
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => saveEdit(budget)}
                    disabled={isPending}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 sm:flex-none"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => startEdit(budget)}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                    onClick={() => removeBudget(budget.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
