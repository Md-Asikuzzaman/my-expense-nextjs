"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFallbackCategoryColor } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

type CategoryTotal = { category: string; value: number };
type TrendRow = Record<string, string | number>;
type FinanceTrendRow = {
  month: string;
  income: number;
  expense: number;
  net: number;
};
type FinanceView = "expense" | "income-vs-expense" | "net-cashflow";
type DonutDatum = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

function resolveColor(
  key: string,
  index: number,
  categoryColors?: Record<string, string>,
) {
  return categoryColors?.[key] ?? getFallbackCategoryColor(index);
}

function buildDonutData(
  categoryTotals: CategoryTotal[],
  categoryColors?: Record<string, string>,
) {
  // sanitize and merge duplicate/invalid category entries
  const merged = categoryTotals.reduce<Record<string, number>>((acc, cur) => {
    const name = String(cur.category ?? "").trim();
    if (!name) return acc;
    if ((cur.value ?? 0) <= 0) return acc;
    acc[name] = (acc[name] ?? 0) + Number(cur.value ?? 0);
    return acc;
  }, {});

  const sorted = Object.entries(merged)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    return [] as DonutDatum[];
  }

  // Return categories exactly as they come from the DB (filtered and sorted).
  // Avoid adding an aggregated "Others" slice so the chart reflects DB data.
  const base = sorted.map((item, index) => ({
    name: item.category,
    value: item.value,
    color: resolveColor(item.category, index, categoryColors),
    percent: (item.value / total) * 100,
  }));

  return base;
}

function buildMonthlyTotals(monthlyCategoryTrend: TrendRow[]) {
  const latestSix = monthlyCategoryTrend.slice(-6);

  return latestSix.map((row) => {
    const total = Object.entries(row)
      .filter(([key]) => key !== "month")
      .reduce((sum, [, value]) => sum + Number(value ?? 0), 0);

    return {
      month: String(row.month ?? ""),
      total,
    };
  });
}

export function ChartsSection({
  categoryTotals,
  monthlyCategoryTrend,
  monthlyFinanceTrend,
  categoryColors,
}: {
  categoryTotals: CategoryTotal[];
  monthlyCategoryTrend: TrendRow[];
  monthlyFinanceTrend?: FinanceTrendRow[];
  categoryColors?: Record<string, string>;
}) {
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);
  const [activeComparisonIndex, setActiveComparisonIndex] = useState<
    number | null
  >(null);
  const [financeView, setFinanceView] = useState<FinanceView>("income-vs-expense");

  const donutData = useMemo(
    () => buildDonutData(categoryTotals, categoryColors),
    [categoryTotals, categoryColors],
  );

  const monthlyTotals = useMemo(
    () => buildMonthlyTotals(monthlyCategoryTrend),
    [monthlyCategoryTrend],
  );

  const financeTrend = useMemo(() => {
    if (monthlyFinanceTrend?.length) {
      return monthlyFinanceTrend.slice(-6);
    }

    return monthlyTotals.map((item) => ({
      month: item.month,
      income: 0,
      expense: item.total,
      net: -item.total,
    }));
  }, [monthlyFinanceTrend, monthlyTotals]);

  const comparisonData = useMemo(
    () => [...categoryTotals].sort((a, b) => b.value - a.value),
    [categoryTotals],
  );

  const trendDelta = useMemo(() => {
    if (financeTrend.length < 2) {
      return { amount: 0, percent: 0, isUp: false, isGood: true };
    }

    const currentPoint = financeTrend[financeTrend.length - 1];
    const previousPoint = financeTrend[financeTrend.length - 2];

    const current =
      financeView === "expense"
        ? (currentPoint?.expense ?? 0)
        : financeView === "income-vs-expense"
          ? (currentPoint?.income ?? 0) - (currentPoint?.expense ?? 0)
          : (currentPoint?.net ?? 0);
    const previous =
      financeView === "expense"
        ? (previousPoint?.expense ?? 0)
        : financeView === "income-vs-expense"
          ? (previousPoint?.income ?? 0) - (previousPoint?.expense ?? 0)
          : (previousPoint?.net ?? 0);
    const amount = current - previous;
    const percent = previous === 0 ? 0 : (amount / previous) * 100;

    // Movement direction
    const isUp = amount >= 0;
    // Define whether this movement is "good" for the user:
    // - For expense view, a decrease in expense (amount < 0) is good
    // - For income-vs-expense and net-cashflow, an increase (amount >= 0) is good
    const isGood = financeView === "expense" ? amount <= 0 : isUp;

    return {
      amount,
      percent,
      isUp,
      isGood,
    };
  }, [financeTrend, financeView]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="w-full h-120 sm:h-128 lg:h-136 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">
                Expense Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Top categories with small spend grouped into Others
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col gap-3">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="82%"
                      cx="50%"
                      cy="50%"
                      paddingAngle={2}
                      onMouseLeave={() => setActiveDonutIndex(null)}
                      isAnimationActive
                      animationDuration={600}
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          fillOpacity={
                            activeDonutIndex === null ||
                            activeDonutIndex === index
                              ? 1
                              : 0.28
                          }
                          stroke={
                            activeDonutIndex === index ? "#FFFFFF" : "none"
                          }
                          strokeWidth={activeDonutIndex === index ? 2 : 0}
                          onMouseEnter={() => setActiveDonutIndex(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const payload = item.payload as DonutDatum;
                        return [
                          `${formatCurrency(Number(value ?? 0))} (${payload.percent.toFixed(1)}%)`,
                          payload.name,
                        ];
                      }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid rgba(148,163,184,0.2)",
                        boxShadow: "0 10px 25px rgba(2,8,23,0.18)",
                        background: "rgba(15,23,42,0.94)",
                        color: "#E2E8F0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="max-h-24 overflow-y-auto rounded-lg border border-border/60 p-2">
                <div className="space-y-1.5">
                  {donutData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="inline-flex min-w-0 items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={
                          activeDonutIndex === null ||
                          activeDonutIndex === index
                            ? "font-medium"
                            : "font-medium opacity-50"
                        }
                      >
                        {formatCurrency(item.value)} ({item.percent.toFixed(1)}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="w-full h-120 sm:h-128 lg:h-136 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">
                Monthly Trends
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm flex flex-col gap-2">
                <span>Spending over recent months</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={
                      financeView === "income-vs-expense" ? "default" : "outline"
                    }
                    onClick={() => setFinanceView("income-vs-expense")}
                  >
                    Income vs expense
                  </Button>
                  <Button
                    size="sm"
                    variant={financeView === "expense" ? "default" : "outline"}
                    onClick={() => setFinanceView("expense")}
                  >
                    Expense only
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      financeView === "net-cashflow" ? "default" : "outline"
                    }
                    onClick={() => setFinanceView("net-cashflow")}
                  >
                    Net Cashflow
                  </Button>
                </div>
                <span className={trendDelta.isUp ? "text-emerald-500" : "text-rose-500"}>
                  {trendDelta.isUp ? "Up" : "Down"}{" "}
                  {formatCurrency(Math.abs(trendDelta.amount))} (
                  {Math.abs(trendDelta.percent).toFixed(1)}%)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={financeTrend}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="expenseFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#EF4444"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="#EF4444"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#16A34A"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="#16A34A"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#14B8A6"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="#14B8A6"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  {/* Minimal grid for clarity removed per design preference */}
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(Number(value))}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value ?? 0)),
                      String(name),
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(148,163,184,0.2)",
                      boxShadow: "0 10px 25px rgba(2,8,23,0.18)",
                      background: "rgba(15,23,42,0.94)",
                      color: "#E2E8F0",
                    }}
                  />
                  {(financeView === "expense" ||
                    financeView === "income-vs-expense") && (
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      fill="url(#expenseFill)"
                      name="Expense"
                      activeDot={{
                        r: 6,
                        stroke: "#EF4444",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      isAnimationActive
                      animationDuration={700}
                    />
                  )}
                  {financeView === "income-vs-expense" && (
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#16A34A"
                      strokeWidth={2.2}
                      fill="url(#incomeFill)"
                      name="Income"
                      activeDot={{
                        r: 6,
                        stroke: "#16A34A",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      isAnimationActive
                      animationDuration={700}
                    />
                  )}
                  {financeView === "net-cashflow" && (
                    <Area
                      type="monotone"
                      dataKey="net"
                      stroke="#14B8A6"
                      strokeWidth={2.5}
                      fill="url(#netFill)"
                      name="Net Cashflow"
                      activeDot={{
                        r: 6,
                        stroke: "#14B8A6",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                      isAnimationActive
                      animationDuration={700}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Category Comparison
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Descending category totals for quick side-by-side comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                layout="vertical"
                margin={{ top: 8, right: 26, left: 24, bottom: 4 }}
                onMouseLeave={() => setActiveComparisonIndex(null)}
              >
                {/* simplified visuals: no chart grid lines */}
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(Number(value))}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={92}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Amount",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    boxShadow: "0 10px 25px rgba(2,8,23,0.18)",
                    background: "rgba(15,23,42,0.94)",
                    color: "#E2E8F0",
                  }}
                  labelStyle={{ color: "#F8FAFC", fontWeight: 600 }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive>
                  {comparisonData.map((item, index) => (
                    <Cell
                      key={item.category}
                      fill={resolveColor(item.category, index, categoryColors)}
                      fillOpacity={
                        activeComparisonIndex === null ||
                        activeComparisonIndex === index
                          ? 1
                          : 0.28
                      }
                      onMouseEnter={() => setActiveComparisonIndex(index)}
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    fill="var(--color-foreground)"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
