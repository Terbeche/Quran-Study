import { Link } from '@/i18n/routing';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { getTranslations } from 'next-intl/server';

export default async function SignUpPage() {
  const t = await getTranslations('auth.signUp');
  
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="card glass">
          <h1 className="text-3xl font-bold text-center mb-6 text-accent">{t('title')}</h1>
          
          <SignUpForm />

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--foreground)' }}>
            {t('haveAccount')}{' '}
            <Link href="/auth/signin" className="link font-medium">
              {t('signInLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
