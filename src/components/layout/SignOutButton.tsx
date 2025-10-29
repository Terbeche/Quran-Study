'use client';

import { signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';

export function SignOutButton() {
  const t = useTranslations('header');
  const locale = useLocale();
  
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: `/${locale}`,
      redirect: true 
    });
  };
  
  return (
    <button
      onClick={handleSignOut}
      className="text-sm px-3 py-1.5 rounded-lg transition-all duration-300 font-medium hover:scale-105 hover:shadow-md"
      style={{ 
        background: 'rgba(239, 68, 68, 0.1)', 
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}
    >
      {t('signOut')}
    </button>
  );
}
