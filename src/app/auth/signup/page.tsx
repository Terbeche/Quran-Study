import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="card glass">
          <h1 className="text-3xl font-bold text-center mb-6 text-accent">Create Account</h1>
          
          <SignUpForm />

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--foreground)' }}>
            Already have an account?{' '}
            <Link href="/auth/signin" className="link font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
