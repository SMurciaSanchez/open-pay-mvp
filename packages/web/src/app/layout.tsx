import './globals.css';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

// Metadata for the application
export const metadata = {
  title: 'OpenPay | Secure Financial Solutions',
  description: 'OpenPay offers secure and reliable financial services for individuals and businesses.',
  keywords: 'fintech, payments, transactions, secure financial services',
  authors: [{ name: 'OpenPay Team' }],
  creator: 'OpenPay',
  themeColor: '#0ea5e9',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
        {/* Providers will be added here (auth, themes, etc.) */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* Add toaster for notifications */}
        <Toaster />
      </body>
    </html>
  );
} 