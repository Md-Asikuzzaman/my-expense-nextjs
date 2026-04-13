"use client";

import { useTransition } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

import { exportPdfDataAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function ExportPdfButton({
  filters,
}: {
  filters: Record<string, string | undefined>;
}) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const rows = await exportPdfDataAction(filters);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("PulseLedger - Expense Report", 14, 16);

      autoTable(doc, {
        startY: 24,
        head: [["Title", "Amount", "Type", "Category", "Date"]],
        body: rows.map((item) => [
          item.title,
          item.amount.toFixed(2),
          item.type,
          item.category,
          new Date(item.date).toLocaleDateString(),
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [99, 102, 241],
        },
      });

      doc.save("expenses-report.pdf");
      toast.success("PDF exported.");
    });
  };

  return (
    <Button variant="outline" onClick={onClick} disabled={isPending}>
      {isPending ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
