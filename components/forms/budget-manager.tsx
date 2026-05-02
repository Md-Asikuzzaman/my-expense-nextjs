"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteBudgetAction, upsertBudgetAction } from "@/app/actions";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
        category: budget.category,
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
            className={cn(
              "flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-start sm:justify-between",
              isEditing
                ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/70 hover:border-border"
            )}
          >
            <div className="flex items-center h-8">
              <p className="text-sm font-medium">{budget.category}</p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto">
              {isEditing ? (
                <div className="flex w-full flex-col gap-2 sm:min-w-[200px]">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      className="h-8 pl-6 text-sm w-full"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={editedLimit}
                      onChange={(event) => setEditedLimit(event.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(budget)}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      className="h-8 px-4 text-xs"
                      onClick={() => saveEdit(budget)}
                      disabled={isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => startEdit(budget)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-9 px-3"
                    onClick={() => removeBudget(budget.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
