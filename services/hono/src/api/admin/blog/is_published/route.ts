import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { postgres } from '@/lib/postgres'
import { blog_posts } from '@/lib/postgres/schema'
import {
  zodBlogPostTitle,
  zodBlogPostIsPublished,
} from '@/lib/postgres/data/zod'
import { eq } from 'drizzle-orm'

export const routeAdminBlogIsPublished = new Hono().post(
  '/',
  zValidator(
    'json',
    z.object({ title: zodBlogPostTitle, is_published: zodBlogPostIsPublished }),
    (result, c) => {
      if (!result.success) {
        return c.json(
          { message: 'Invalid request', error: result.error.issues },
          400
        )
      }
    }
  ),
  async (c) => {
    const { title, is_published } = c.req.valid('json')

    try {
      await postgres
        .update(blog_posts)
        .set({ is_published: !is_published })
        .where(eq(blog_posts.title, title))
    } catch (error) {
      console.error(error)
      return c.json(null, 500)
    }

    return c.json(null, 200)
  }
)
