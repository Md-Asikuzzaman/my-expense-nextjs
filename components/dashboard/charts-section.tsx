'use client';

import { motion } from 'framer-motion';
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
} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

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
    <div className='grid gap-4 lg:grid-cols-2'>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className='w-full overflow-hidden'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base sm:text-lg'>
              Expense Distribution
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              Breakdown by category
            </CardDescription>
          </CardHeader>
          <CardContent className='h-56 sm:h-64 lg:h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey='value'
                  nameKey='category'
                  outerRadius='80%'
                  cx='50%'
                  cy='50%'
                  label={({ percent }) =>
                    typeof percent === 'number' && percent > 0.05
                      ? `${(percent * 100).toFixed(0)}%`
                      : ''
                  }
                  labelLine={false}
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    'Amount',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend
                  verticalAlign='bottom'
                  height={36}
                  iconType='circle'
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
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
        <Card className='w-full overflow-hidden'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base sm:text-lg'>
              Monthly Trends
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              Spending over recent months
            </CardDescription>
          </CardHeader>
          <CardContent className='h-56 sm:h-64 lg:h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={monthlyCategoryTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(99,102,241,0.08)'
                  vertical={false}
                />
                <XAxis
                  dataKey='month'
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
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
                />
                <Legend
                  verticalAlign='top'
                  height={20}
                  iconType='circle'
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                {Object.keys(monthlyCategoryTrend[0] ?? {})
                  .filter((key) => key !== 'month')
                  .slice(0, 4) // Limit to 4 categories for mobile readability
                  .map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={COLORS[index % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
