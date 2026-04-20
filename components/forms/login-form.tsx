'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

import { loginAction } from '@/app/actions';
import { loginSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.ok === false) {
        toast.error(result.message);
      }
    });
  });

  return (
    <motion.form
      onSubmit={onSubmit}
      className='grid gap-5'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Email */}
      <div className='grid gap-2'>
        <Label htmlFor='email'>Email</Label>
        <div className='relative'>
          <Mail className='absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='email'
            type='email'
            inputMode='email'
            autoComplete='email'
            placeholder='Enter your email'
            className={cn(
              'h-12 sm:h-11 pl-10',
              errors.email &&
                'border-destructive focus-visible:ring-destructive',
            )}
            {...form.register('email')}
          />
        </div>
        {errors.email && (
          <p className='text-xs text-destructive'>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className='grid gap-2'>
        <Label htmlFor='password'>Password</Label>
        <div className='relative'>
          <Lock className='absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='password'
            type='password'
            autoComplete='current-password'
            placeholder='Enter your password'
            className={cn(
              'h-12 sm:h-11 pl-10',
              errors.password &&
                'border-destructive focus-visible:ring-destructive',
            )}
            {...form.register('password')}
          />
        </div>
        {errors.password && (
          <p className='text-xs text-destructive'>{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <Button
          type='submit'
          disabled={isPending}
          className='h-12 w-full text-base font-semibold shadow-lg shadow-[#DC2626]/25'
        >
          {isPending ? (
            <span className='flex items-center gap-2'>
              <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
