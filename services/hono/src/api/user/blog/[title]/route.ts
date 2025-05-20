import type { typeBlogPost } from '@/lib/postgres/data/type'

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { zodBlogPostTitle } from '@/lib/postgres/data/zod'
import { postgres } from '@/lib/postgres'
import { blog_posts } from '@/lib/postgres/schema'
import { and, eq } from 'drizzle-orm'

export const routeUserBlogTitle = new Hono().get(
  '/:title',
  zValidator('param', z.object({ title: zodBlogPostTitle }), (result, c) => {
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const { title } = c.req.valid('param')

    let blogPost: undefined | typeBlogPost
    try {
      const array = await postgres
        .select()
        .from(blog_posts)
        .where(
          and(eq(blog_posts.title, title), eq(blog_posts.is_published, true))
        )
        .limit(1)
      blogPost = array[0]
    } catch (error) {
      console.error(error)

      return c.json(null, 500)
    }

    return c.json({ response: blogPost }, 200)
  }
)
