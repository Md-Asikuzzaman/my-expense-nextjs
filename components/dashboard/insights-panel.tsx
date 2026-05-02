'use client';

import { motion } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerItemVariants } from '@/lib/animations';

export function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <Card className='w-full overflow-hidden'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30'>
            <Sparkles className='size-4 text-indigo-500' />
          </div>
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 sm:space-y-3'>
        {insights.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Lightbulb className='size-8 text-muted-foreground/50 mb-2' />
            <p className='text-sm text-muted-foreground'>
              No insights available yet
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Add more transactions to get personalized insights
            </p>
          </div>
        ) : (
          <motion.div initial='initial' animate='animate' className='space-y-2'>
            {insights.map((insight, index) => (
              <motion.div
                key={insight}
                variants={staggerItemVariants}
                custom={index}
                className='rounded-xl border border-border/60 bg-muted/40 p-3 sm:p-4 hover:bg-muted/60 transition-colors'
              >
                <p className='text-sm leading-relaxed'>{insight}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
