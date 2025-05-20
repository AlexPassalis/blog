import { defineConfig } from 'astro/config'
import { envServer } from './src/data/env/envServer'
import sitemap from '@astrojs/sitemap'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import node from '@astrojs/node'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  integrations: [sitemap(), react()],
  prefetch: true,
  image: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: envServer.MINIO_DOMAIN,
        port: envServer.MINIO_PORT,
        pathname: `/${envServer.MINIO_BUCKET}/**`,
      },
    ],
  },
  experimental: {
    responsiveImages: true,
  },
  site: envServer.SITE,
  vite: {
    plugins: [tsconfigPaths(), tailwindcss()],
    host: true,
    port: envServer.SITE,
    server: {
      host: true,
      origin: envServer.SITE,
      port: envServer.PORT,
      ...(envServer.ENVIRONMENT === 'development'
        ? {
            watch: {
              usePolling: true,
            },
          }
        : {}),
      ...(envServer.ENVIRONMENT === 'development'
        ? {
            proxy: {
              '/api': 'http://localhost:3000',
            },
          }
        : {}),
    },
  },
})
