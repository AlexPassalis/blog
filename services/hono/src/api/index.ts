import { Hono } from 'hono'
import { routeN8nBlog } from '@/api/n8n/blog/route'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { routeAdminBlogIsPublished } from '@/api/admin/blog/is_published/route'
import { envServer } from '@/data/env/envServer'
import { auth } from '@/lib/better-auth/server'
import { routeUserBlog } from '@/api/user/blog/route'

const app = new Hono()
app.use(logger())
app.use(
  '/api/auth/*',
  cors({
    origin: envServer.BETTER_AUTH_TRUSTED_ORIGINS[0],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api/n8n/blog', routeN8nBlog)

const api = new Hono()
  .route('/admin/blog/is_published', routeAdminBlogIsPublished)
  .route('/user/blog', routeUserBlog)

export type typeApi = typeof api

app.route('/api', api)

export { app }
