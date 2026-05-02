"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Command } from "lucide-react";

import { useQuickAddStore } from "@/stores/quick-add-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/forms/expense-form";

export function QuickAddModal({ categories }: { categories: string[] }) {
  const { open, setOpen } = useQuickAddStore();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:block"
          >
            <Button
              size="lg"
              className="rounded-full shadow-lg h-12 px-6 gap-2 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
            >
              <Plus className="size-5" />
              <span>Add Expense</span>
              <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-white/20 px-1.5 py-0.5 text-xs font-mono">
                <Command className="size-3" />
                <span>K</span>
              </kbd>
            </Button>
          </motion.div>
        }
      />

      {/* Mobile FAB */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="sm:hidden fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
        aria-label="Add expense"
      >
        <Plus className="size-6" />
      </motion.button>

      <DialogContent className="max-w-xl sm:max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-indigo-500" />
            Add New Transaction
          </DialogTitle>
          <DialogDescription>
            Quick add a new expense or income transaction
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <ExpenseForm
            categories={categories}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
