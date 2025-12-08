import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Choose your account type to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild size="lg" className="w-full" variant="outline">
            <Link href="/auth/register/talent">
              I am a Talent
            </Link>
          </Button>
          <Button asChild size="lg" className="w-full" variant="outline">
            <Link href="/auth/register/establishment">
              I am an Establishment
            </Link>
          </Button>
          <div className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
