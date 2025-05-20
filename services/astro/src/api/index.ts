import { Hono } from 'hono'
import { routeUserBlogTitle } from '@/api/user/blog/[title]/route'

const api = new Hono().basePath('/api').route('/', routeUserBlogTitle)

export { api }
