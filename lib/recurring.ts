import "server-only";

import { addDays, addMonths, addWeeks, isAfter } from "date-fns";
import prisma from "@/lib/prisma";

function nextDate(base: Date, recurrence: "DAILY" | "WEEKLY" | "MONTHLY") {
  if (recurrence === "DAILY") return addDays(base, 1);
  if (recurrence === "WEEKLY") return addWeeks(base, 1);
  return addMonths(base, 1);
}

export async function runRecurringAutomation() {
  const now = new Date();
  const recurring = await prisma.expense.findMany({
    where: {
      isRecurring: true,
      recurrence: { not: null },
      nextRecurringRun: { lte: now },
      type: "EXPENSE",
    },
    take: 100,
  });

  for (const template of recurring) {
    if (!template.recurrence || !template.nextRecurringRun) {
      continue;
    }

    let runAt = template.nextRecurringRun;
    const creations: Array<{
      title: string;
      amount: number;
      type: "INCOME" | "EXPENSE";
      category: string;
      note?: string;
      date: Date;
      isRecurring: boolean;
    }> = [];

    while (!isAfter(runAt, now)) {
      creations.push({
        title: template.title,
        amount: template.amount,
        type: template.type,
        category: template.category,
        note: template.note ?? undefined,
        date: runAt,
        isRecurring: false,
      });
      runAt = nextDate(runAt, template.recurrence);
      if (creations.length > 12) {
        break;
      }
    }

    await prisma.$transaction([
      ...(creations.length
        ? [
            prisma.expense.createMany({
              data: creations,
            }),
          ]
        : []),
      prisma.expense.update({
        where: { id: template.id },
        data: { nextRecurringRun: runAt },
      }),
    ]);
  }
}
