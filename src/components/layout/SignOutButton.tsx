'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export function SignOutButton() {
  const t = useTranslations('header');
  
  return (
    <button
      onClick={() => signOut()}
      className="text-sm px-3 py-1.5 rounded-lg transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium"
    >
      {t('signOut')}
    </button>
  );
}
