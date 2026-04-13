"use client";

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

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f43f5e", "#f59e0b"];

type WaveBarProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
};

function WaveBar({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "#6366f1",
}: WaveBarProps) {
  const wave = Math.min(8, Math.max(2, height * 0.2));
  const path = [
    `M ${x} ${y + height}`,
    `L ${x} ${y + wave}`,
    `Q ${x + width * 0.25} ${y - wave} ${x + width * 0.5} ${y + wave}`,
    `Q ${x + width * 0.75} ${y + wave * 2} ${x + width} ${y + wave}`,
    `L ${x + width} ${y + height}`,
    "Z",
  ].join(" ");

  return <path d={path} fill={fill} opacity={0.9} />;
}

type CategoryTotal = { category: string; value: number };
type TrendRow = Record<string, string | number>;

export function ChartsSection({
  categoryTotals,
  monthlyCategoryTrend,
}: {
  categoryTotals: CategoryTotal[];
  monthlyCategoryTrend: TrendRow[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Expense Distribution</CardTitle>
          <CardDescription>Pie chart by category</CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="value"
                nameKey="category"
                outerRadius={100}
              >
                {categoryTotals.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Category Trends</CardTitle>
          <CardDescription>Bar wave chart over recent months</CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCategoryTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(99,102,241,0.15)"
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(monthlyCategoryTrend[0] ?? {})
                .filter((key) => key !== "month")
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    shape={<WaveBar />}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
