'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { SignOutButton } from './SignOutButton';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

interface MobileMenuProps {
  readonly isAuthenticated: boolean;
  readonly userName?: string | null;
  readonly userEmail?: string | null;
}

export function MobileMenu({ isAuthenticated, userName, userEmail }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('header');

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex md:hidden flex-col gap-1.5 p-2 cursor-pointer hover:opacity-80 transition-all"
        aria-label="Toggle menu"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <span 
          className={`block w-7 h-0.5 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}
          style={{ backgroundColor: 'var(--primary-green)' }}
        />
        <span 
          className={`block w-7 h-0.5 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}
          style={{ backgroundColor: 'var(--primary-green)' }}
        />
        <span 
          className={`block w-7 h-0.5 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
          style={{ backgroundColor: 'var(--primary-green)' }}
        />
      </button>

      {/* Mobile Menu Overlay - rendered via portal at document root */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] md:hidden animate-fade-in"
          onClick={closeMenu}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 shadow-2xl p-6 overflow-y-auto animate-slide-in-right"
            style={{ 
              background: 'var(--card-bg)',
              borderLeft: '1px solid var(--card-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeMenu}
              className="absolute top-4 right-4 text-2xl text-accent hover:opacity-80 transition-opacity"
              aria-label="Close menu"
            >
              ×
            </button>

            {/* User Info */}
            {isAuthenticated && (
              <div className="mb-6 pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 avatar-bg rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-accent truncate">
                      {userName || userEmail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col gap-4 mb-6">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="text-lg font-medium text-accent hover:underline transition-colors"
                  >
                    {t('profile')}
                  </Link>
                  <Link
                    href="/tags"
                    onClick={closeMenu}
                    className="text-lg font-medium text-accent hover:underline transition-colors"
                  >
                    {t('myTags')}
                  </Link>
                  <Link
                    href="/collections"
                    onClick={closeMenu}
                    className="text-lg font-medium text-accent hover:underline transition-colors"
                  >
                    {t('collections')}
                  </Link>
                  <Link
                    href="/community-tags"
                    onClick={closeMenu}
                    className="text-lg font-medium text-accent hover:underline transition-colors"
                  >
                    {t('community')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/community-tags"
                    onClick={closeMenu}
                    className="text-lg font-medium text-accent hover:underline transition-colors"
                  >
                    {t('community')}
                  </Link>
                  <Link
                    href="/auth/signin"
                    onClick={closeMenu}
                    className="text-lg font-medium text-accent hover:underline transition-colors"
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={closeMenu}
                    className="btn-primary text-center"
                  >
                    {t('signUp')}
                  </Link>
                </>
              )}
            </nav>

            {/* Theme & Language Switchers */}
            <div className="flex flex-col gap-4 pt-4 border-t" style={{ borderColor: 'rgba(4,120,87,0.2)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Theme
                </span>
                <ThemeSwitcher />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Language
                </span>
                <LanguageSwitcher />
              </div>
            </div>

            {/* Sign Out */}
            {isAuthenticated && (
              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(4,120,87,0.2)' }}>
                <SignOutButton />
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
