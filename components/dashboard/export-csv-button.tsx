"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { exportCsvAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function ExportCsvButton({
  filters,
}: {
  filters: Record<string, string | undefined>;
}) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const csv = await exportCsvAction(filters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "expenses.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV exported.");
    });
  };

  return (
    <Button variant="outline" onClick={onClick} disabled={isPending}>
      {isPending ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
