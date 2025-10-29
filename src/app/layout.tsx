import type { Metadata } from "next";
import { Inter, Amiri } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });
const amiri = Amiri({ 
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-amiri'
});

export const metadata: Metadata = {
  title: {
    default: 'Quran Study - Tag, Organize, and Study the Quran',
    template: '%s | Quran Study',
  },
  description: 'Tag verses, create collections, and study the Quran with community insights. Features verse-by-verse audio, translations, and collaborative tagging.',
  keywords: ['Quran', 'Islam', 'Study', 'Tags', 'Verses', 'Translation', 'Audio', 'Collections'],
  ...(process.env.NEXT_PUBLIC_APP_URL && {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL),
  }),
  openGraph: {
    type: 'website',
    siteName: 'Quran Study',
    title: 'Quran Study - Tag, Organize, and Study the Quran',
    description: 'Tag verses, create collections, and study the Quran with community insights.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${amiri.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
