'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardVariants } from '@/lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
  hover?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  index = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial='initial'
      animate='animate'
      whileHover={hover ? 'hover' : undefined}
      whileTap={onClick ? 'tap' : undefined}
      custom={index}
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm backdrop-blur-sm',
        'transition-shadow duration-200',
        hover && 'hover:shadow-md hover:border-border/80',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedContainer({
  children,
  className,
  staggerDelay = 0.08,
}: AnimatedContainerProps) {
  return (
    <motion.div
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial='initial'
      animate='animate'
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stat Card specifically for dashboard metrics
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  variant?: 'income' | 'expense' | 'savings' | 'default';
  index?: number;
}

const variantStyles = {
  income:
    'bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 border-emerald-500/20',
  expense:
    'bg-gradient-to-br from-rose-500/10 to-rose-400/5 border-rose-500/20',
  savings:
    'bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border-indigo-500/20',
  default: '',
};

const iconColors = {
  income: 'text-emerald-500',
  expense: 'text-rose-500',
  savings: 'text-indigo-500',
  default: 'text-muted-foreground',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  index = 0,
}: StatCardProps) {
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
        <span className={cn('size-5', iconColors[variant])}>{icon}</span>
      </div>
      <div className='space-y-1'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
          className='text-2xl sm:text-3xl font-bold tracking-tight'
        >
          {value}
        </motion.div>
        {subtitle && <div className='text-xs'>{subtitle}</div>}
      </div>
    </motion.div>
  );
}
