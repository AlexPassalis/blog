import { envServer } from '@/data/env/envServer'
import { serve } from '@hono/node-server'
import { app } from '@/api/index'

if (envServer.IS_NOT_BUILD_TIME) {
  serve(
    {
      fetch: app.fetch,
      port: envServer.PORT,
    },
    ({ port }) => console.info(`Hono is listening on port: ${port}.`)
  )
}
