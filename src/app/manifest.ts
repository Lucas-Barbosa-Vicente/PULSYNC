import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pulsync',
    short_name: 'Pulsync',
    description: 'Sincronize sua saúde. Viva mais, juntos.',
    start_url: '/home',
    display: 'standalone',
    background_color: '#0D0F14',
    theme_color: '#00D4AA',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/screenshots/home.png', sizes: '390x844', type: 'image/png' },
    ],
    categories: ['health', 'fitness', 'lifestyle'],
  }
}
