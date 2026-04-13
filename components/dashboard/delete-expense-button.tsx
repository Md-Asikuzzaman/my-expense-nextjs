"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteExpenseAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="destructive"
      onClick={() => {
        startTransition(async () => {
          await deleteExpenseAction(id);
          toast.success("Transaction deleted.");
          router.push("/dashboard");
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
