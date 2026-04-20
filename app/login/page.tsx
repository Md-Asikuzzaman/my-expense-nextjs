import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { motion } from 'framer-motion';

import { getSession } from '@/lib/auth';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { LoginForm } from '@/components/forms/login-form';
import { SpiderLogo } from '@/components/spider-logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function LoginPage() {
  return (
    <Suspense fallback={<div className='p-6'>Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  await connection();
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center p-4'>
      {/* Background glow effects - positioned absolute to avoid layout shift */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        {/* Red glow top-right */}
        <div className='absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#DC2626]/10 blur-[100px] md:blur-[120px]' />
        {/* Cyan glow bottom-left */}
        <div className='absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[#0891B2]/8 blur-[80px] md:blur-[100px]' />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className='relative z-10 w-full max-w-md'
      >
        {/* Logo & Title Section */}
        <div className='mb-6 flex flex-col items-center text-center'>
          <SpiderLogo size={80} className='mb-4' />
          <h1 className='bg-gradient-to-r from-[#DC2626] to-[#0891B2] bg-clip-text text-3xl font-bold text-transparent'>
            {APP_NAME}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>{APP_TAGLINE}</p>
        </div>

        <Card className='border border-border/50 bg-card/80 shadow-xl backdrop-blur-xl'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-xl'>Welcome back</CardTitle>
            <CardDescription>
              Sign in with your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className='mt-6 text-center text-xs text-muted-foreground'>
          Secure. Fast. Heroic.
        </p>
      </motion.div>
    </div>
  );
}
