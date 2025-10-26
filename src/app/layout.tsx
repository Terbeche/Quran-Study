import type { Metadata } from "next";
import { Inter, Amiri } from 'next/font/google';
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });
const amiri = Amiri({ 
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-amiri'
});

export const metadata: Metadata = {
  title: "QuranVerseTagger - Personal Quranic Study Tool",
  description: "Tag, organize, and reflect on Quranic verses with community insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${amiri.variable}`}>
        <SessionProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
