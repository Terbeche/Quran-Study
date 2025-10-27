import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="card glass">
          <h1 className="text-3xl font-bold text-center mb-6 text-accent">Sign In</h1>
          
          <SignInForm />

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--foreground)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="link font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
