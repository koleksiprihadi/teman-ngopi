// src/app/layout.js
import { Playfair_Display, Nunito } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth/authContext';
import PWARegister from '@/components/ui/PWARegister';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Next.js 15+: viewport harus export terpisah
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#5C3317',
};

export const metadata = {
  title: 'Teman Ngopi POS',
  description: 'Sistem Point of Sale modern untuk Teman Ngopi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Teman Ngopi',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${playfair.variable} ${nunito.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body bg-cream-100 min-h-screen antialiased">
        <AuthProvider>
          <PWARegister />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#2C1810',
                color: '#FDF5E6',
                fontFamily: 'Nunito, sans-serif',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
              },
              success: {
                iconTheme: { primary: '#34d399', secondary: '#2C1810' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#2C1810' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
