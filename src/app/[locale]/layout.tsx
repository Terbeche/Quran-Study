import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  
  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded z-50"
        >
          {String(messages.common?.skipToMainContent || 'Skip to main content')}
        </a>
        <Header />
        <main id="main-content" className="min-h-screen bg-gray-50">
          {children}
        </main>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
