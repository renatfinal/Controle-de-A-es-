import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'RF Investimentos',
    short_name: 'RF Invest',
    description: 'Sistema profissional de acompanhamento de investimentos, balancete financeiro, agenda de operações e relatórios IRPF com funcionamento offline.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0B0F0C',
    theme_color: '#0B0F0C',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
