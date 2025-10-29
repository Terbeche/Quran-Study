'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
] as const;

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium text-emerald-600">
          {currentLanguage?.nativeName}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md ${
              locale === lang.code ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </span>
              {locale === lang.code && <span className="text-emerald-600">✓</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
