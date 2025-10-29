import { Link } from '@/i18n/routing';
import { SignInForm } from '@/components/auth/SignInForm';
import { getTranslations } from 'next-intl/server';

export default async function SignInPage() {
  const t = await getTranslations('auth.signIn');
  
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="card glass">
          <h1 className="text-3xl font-bold text-center mb-6 text-accent">{t('title')}</h1>
          
          <SignInForm />

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--foreground)' }}>
            {t('noAccount')}{' '}
            <Link href="/auth/signup" className="link font-medium">
              {t('signUpLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
