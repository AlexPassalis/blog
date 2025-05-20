import { Hono } from 'hono'

import { routeUserBlogComment } from '@/api/user/blog/comment/route'
import { routeUserBlogTitle } from './[title]/route'

export const routeUserBlog = new Hono()
  .route('/comment', routeUserBlogComment)
  .route('/', routeUserBlogTitle)
