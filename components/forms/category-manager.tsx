"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CategoryWithUsage = {
  id: string;
  name: string;
  color: string;
  expenseCount: number;
  budgetCount: number;
};

export function CategoryManager({
  categories,
}: {
  categories: CategoryWithUsage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563EB");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#2563EB");

  const createCategory = () => {
    startTransition(async () => {
      const result = await createCategoryAction({
        name,
        color,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Category created.");
      setName("");
      setColor("#2563EB");
      router.refresh();
    });
  };

  const beginEdit = (category: CategoryWithUsage) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const saveEdit = () => {
    if (!editingId) return;

    startTransition(async () => {
      const result = await updateCategoryAction(editingId, {
        name: editName,
        color: editColor,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Category updated.");
      setEditingId(null);
      setEditName("");
      setEditColor("#2563EB");
      router.refresh();
    });
  };

  const remove = (category: CategoryWithUsage) => {
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Category deleted.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/70 p-4">
        <h3 className="text-sm font-semibold">Create Category</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Add custom categories used across filters, budgets, and transactions.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            className="h-10"
          />
          <Input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 w-full sm:w-16 p-1"
            aria-label="Category color"
          />
          <Button
            onClick={createCategory}
            disabled={isPending || name.trim().length === 0}
            className="h-10"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const usage = category.expenseCount + category.budgetCount;
              const editing = editingId === category.id;

              return (
                <TableRow key={category.id}>
                  <TableCell>
                    {editing ? (
                      <Input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="h-9 max-w-55"
                      />
                    ) : (
                      <span className="font-medium">{category.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <Input
                        type="color"
                        value={editColor}
                        onChange={(event) => setEditColor(event.target.value)}
                        className="h-9 w-14 p-1"
                        aria-label={`Color for ${category.name}`}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-border/60"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {category.color}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {category.expenseCount} tx / {category.budgetCount}{" "}
                      budgets
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={isPending || editName.trim().length === 0}
                          >
                            <Save className="size-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="size-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => beginEdit(category)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => remove(category)}
                            disabled={isPending || usage > 0}
                            title={
                              usage > 0
                                ? "This category is in use and cannot be deleted."
                                : "Delete category"
                            }
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
