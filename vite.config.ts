import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import Sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    Sitemap({
      hostname: 'https://www.atssistemas.ia.br',
      dynamicRoutes: ['/', '/#solutions', '/#roadmap', '/#about', '/#faq', '/#contact', '/privacidade', '/termos'],
      robots: [{
        userAgent: '*',
        allow: '/'
      }]
    })
  ],
})