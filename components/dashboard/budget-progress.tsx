'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Target, Wallet } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { staggerItemVariants } from '@/lib/animations';

type BudgetItem = {
  category: string;
  limit: number;
};

export function BudgetProgress({
  budgets,
  spentByCategory,
}: {
  budgets: BudgetItem[];
  spentByCategory: Record<string, number>;
}) {
  return (
    <Card className='w-full overflow-hidden'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
            <Target className='size-4 text-emerald-600' />
          </div>
          Budget Progress
        </CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          Track your monthly spending limits
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 sm:space-y-5'>
        {budgets.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Wallet className='size-8 text-muted-foreground/50 mb-2' />
            <p className='text-sm text-muted-foreground'>
              No budgets set for this month
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Add budgets to track your spending limits
            </p>
          </div>
        ) : (
          <motion.div initial='initial' animate='animate' className='space-y-4'>
            {budgets.map((budget, index) => {
              const spent = spentByCategory[budget.category] ?? 0;
              const pct = Math.min((spent / budget.limit) * 100, 100);
              const alert = pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'safe';
              const remaining = budget.limit - spent;

              return (
                <motion.div
                  key={budget.category}
                  variants={staggerItemVariants}
                  custom={index}
                  className='space-y-2'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-medium'>
                      {budget.category}
                    </span>
                    <span className='text-xs sm:text-sm text-muted-foreground'>
                      {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={cn(
                      // Track background colors
                      alert === 'danger' && '[&_[data-slot=progress-track]]:bg-rose-200 dark:[&_[data-slot=progress-track]]:bg-rose-900/60',
                      alert === 'warn' && '[&_[data-slot=progress-track]]:bg-amber-200 dark:[&_[data-slot=progress-track]]:bg-amber-900/60',
                      // Indicator colors
                      alert === 'danger' && '[&_[data-slot=progress-indicator]]:bg-rose-500',
                      alert === 'warn' && '[&_[data-slot=progress-indicator]]:bg-amber-500',
                    )}
                  />
                  <div className='flex items-center justify-between'>
                    {alert !== 'safe' ? (
                      <p
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          alert === 'danger'
                            ? 'text-rose-600'
                            : 'text-amber-600',
                        )}
                      >
                        <AlertTriangle className='size-3' />
                        {alert === 'danger'
                          ? 'Budget limit reached'
                          : 'Approaching limit'}
                      </p>
                    ) : (
                      <p className='text-xs text-emerald-600 font-medium'>
                        {formatCurrency(remaining)} remaining
                      </p>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
