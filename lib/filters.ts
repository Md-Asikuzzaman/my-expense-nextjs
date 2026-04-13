import { filterSchema } from "@/lib/schemas";

export type ParsedFilters = {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: "INCOME" | "EXPENSE";
  minAmount?: number;
  maxAmount?: number;
};

export function parseFilters(
  input: Record<string, string | string[] | undefined>,
): ParsedFilters {
  const value = filterSchema.safeParse({
    startDate: asSingle(input.startDate),
    endDate: asSingle(input.endDate),
    category: asSingle(input.category),
    type: asSingle(input.type),
    minAmount: asSingle(input.minAmount),
    maxAmount: asSingle(input.maxAmount),
  });

  if (!value.success) {
    return {};
  }

  const parsed = value.data;
  return {
    startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
    endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
    category: parsed.category,
    type: parsed.type,
    minAmount: parsed.minAmount,
    maxAmount: parsed.maxAmount,
  };
}

function asSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
