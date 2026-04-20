'use client';

import { motion } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cardVariants, containerVariants } from '@/lib/animations';

function Growth({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        positive
          ? 'text-[#0891B2] dark:text-[#06B6D4]'
          : 'text-[#DC2626] dark:text-[#EF4444]',
      )}
    >
      {positive ? (
        <TrendingUp className='size-3' />
      ) : (
        <TrendingDown className='size-3' />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatCard({
  title,
  value,
  growth,
  icon: Icon,
  variant,
  index,
}: {
  title: string;
  value: number;
  growth: number;
  icon: typeof ArrowUpCircle;
  variant: 'income' | 'expense' | 'savings';
  index: number;
}) {
  const variantStyles = {
    income:
      'bg-gradient-to-br from-[#0891B2]/15 to-[#06B6D4]/5 border-[#0891B2]/30 shadow-sm shadow-[#0891B2]/10',
    expense:
      'bg-gradient-to-br from-[#DC2626]/15 to-[#991B1B]/5 border-[#DC2626]/30 shadow-sm shadow-[#DC2626]/10',
    savings:
      'bg-gradient-to-br from-[#DC2626]/10 via-[#0891B2]/5 to-transparent border-[#DC2626]/20 dark:border-[#EF4444]/30',
  };

  const iconColors = {
    income: 'text-[#0891B2] dark:text-[#06B6D4]',
    expense: 'text-[#DC2626] dark:text-[#EF4444]',
    savings: 'text-[#DC2626] dark:text-[#EF4444]',
  };

  return (
    <motion.div
      variants={cardVariants}
      initial='initial'
      animate='animate'
      whileHover='hover'
      custom={index}
      className={cn(
        'rounded-2xl border p-4 sm:p-5 shadow-sm',
        'flex flex-col gap-3',
        variantStyles[variant],
      )}
    >
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-muted-foreground'>
          {title}
        </span>
        <Icon className={cn('size-5', iconColors[variant])} />
      </div>
      <div className='space-y-1'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
          className='text-2xl sm:text-3xl font-bold tracking-tight'
        >
          {formatCurrency(value)}
        </motion.div>
        <Growth value={growth} />
      </div>
    </motion.div>
  );
}

export function OverviewCards({
  currentIncome,
  currentExpense,
  savings,
  incomeGrowth,
  expenseGrowth,
  savingsGrowth,
}: {
  currentIncome: number;
  currentExpense: number;
  savings: number;
  incomeGrowth: number;
  expenseGrowth: number;
  savingsGrowth: number;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial='initial'
      animate='animate'
      className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    >
      <StatCard
        title='Total Income'
        value={currentIncome}
        growth={incomeGrowth}
        icon={ArrowUpCircle}
        variant='income'
        index={0}
      />
      <StatCard
        title='Total Expense'
        value={currentExpense}
        growth={expenseGrowth}
        icon={ArrowDownCircle}
        variant='expense'
        index={1}
      />
      <StatCard
        title='Savings'
        value={savings}
        growth={savingsGrowth}
        icon={Wallet}
        variant='savings'
        index={2}
      />
    </motion.div>
  );
}
