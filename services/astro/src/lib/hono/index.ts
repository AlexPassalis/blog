import { Hono } from 'hono'
import { api } from '@/api/index'
import { envServer } from '@/data/env/envServer'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'

const app = new Hono()

app.route('/', api)

if (envServer.ENVIRONMENT === 'production') {
  const { handler: astroHandler } = await import('./dist/server/entry.mjs')

  app.use('/*', serveStatic({ root: './dist/client' }))
  app.use(astroHandler())
}

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  ({ port }) => console.info(`Hono is listening on port: ${port}.`),
)
