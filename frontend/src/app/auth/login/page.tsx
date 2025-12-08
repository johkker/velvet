'use client';

import { LoginForm } from '@/components/organisms/LoginForm';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (data: any) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your account</p>
        </div>
        <LoginForm onSubmit={handleLogin} />
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
