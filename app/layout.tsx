import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0B0F0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'RF Investimentos - Gestão e Performance de Carteira',
  description: 'Sistema profissional de acompanhamento de investimentos, balancete financeiro, agenda de operações e relatórios IRPF com funcionamento offline.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RF Invest',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    title: 'RF Investimentos - Gestão e Performance de Carteira',
    description: 'Sistema profissional de acompanhamento de investimentos, balancete financeiro, agenda de operações e relatórios IRPF com funcionamento offline.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RF Investimentos - Gestão e Performance de Carteira',
    description: 'Sistema profissional de acompanhamento de investimentos, balancete financeiro, agenda de operações e relatórios IRPF com funcionamento offline.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0B0F0C] text-[#F3F4F6] min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
