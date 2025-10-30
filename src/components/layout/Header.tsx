import { auth } from '@/auth';
import { SignOutButton } from './SignOutButton';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { MobileMenu } from './MobileMenu';
import { getTranslations } from 'next-intl/server';

export async function Header() {
  const session = await auth();
  const t = await getTranslations('header');

  return (
    <header className="header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 avatar-bg rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg md:text-xl font-bold">📖</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-accent">
                {t('appName')}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            {session?.user ? (
              <>
                <Link href="/tags" className="text-accent font-medium transition-colors">
                  {t('myTags')}
                </Link>
                <Link href="/collections" className="text-accent font-medium transition-colors">
                  {t('collections')}
                </Link>
                <Link href="/community-tags" className="text-accent font-medium transition-colors">
                  {t('community')}
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'rgba(4,120,87,0.06)' }}>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105 hover:opacity-80"
                  >
                    <div className="w-8 h-8 avatar-bg rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {session.user.name || session.user.email}
                    </span>
                  </Link>
                  <SignOutButton />
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                </div>
              </>
            ) : (
              <>
                <Link href="/community-tags" className="text-accent font-medium transition-colors">
                  {t('community')}
                </Link>
                <Link 
                  href="/auth/signin" 
                  className="btn-ghost font-medium transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="btn-primary font-medium"
                >
                  {t('signUp')}
                </Link>
                <ThemeSwitcher />
                <LanguageSwitcher />
              </>
            )}
          </nav>

          {/* Mobile Navigation */}
          <MobileMenu
            isAuthenticated={!!session?.user}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
          />
        </div>
      </div>
    </header>
  );
}
