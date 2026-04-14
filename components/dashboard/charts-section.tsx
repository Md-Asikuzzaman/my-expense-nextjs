"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getFallbackCategoryColor } from "@/lib/categories";

type CategoryTotal = { category: string; value: number };
type TrendRow = Record<string, string | number>;

function resolveColor(
  key: string,
  index: number,
  categoryColors?: Record<string, string>,
) {
  return categoryColors?.[key] ?? getFallbackCategoryColor(index);
}

export function ChartsSection({
  categoryTotals,
  monthlyCategoryTrend,
  categoryColors,
}: {
  categoryTotals: CategoryTotal[];
  monthlyCategoryTrend: TrendRow[];
  categoryColors?: Record<string, string>;
}) {
  const trendKeys = Object.keys(monthlyCategoryTrend[0] ?? {}).filter(
    (key) => key !== "month",
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Expense Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Breakdown by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="value"
                  nameKey="category"
                  outerRadius="80%"
                  cx="50%"
                  cy="50%"
                  label={({ percent }) =>
                    typeof percent === "number" && percent > 0.05
                      ? `${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={resolveColor(entry.category, index, categoryColors)}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Monthly Trends
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Spending over recent months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 lg:h-72 flex flex-col gap-3">
            <div className="max-h-16 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] leading-none">
                {trendKeys.map((key, index) => (
                  <div key={key} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: resolveColor(
                          key,
                          index,
                          categoryColors,
                        ),
                      }}
                    />
                    <span className="text-muted-foreground">{key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyCategoryTrend}
                  margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(99,102,241,0.08)"
                    vertical={false}
                  />
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
                    tickFormatter={(value) => `$${value}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                  />
                  {trendKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={resolveColor(key, index, categoryColors)}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
