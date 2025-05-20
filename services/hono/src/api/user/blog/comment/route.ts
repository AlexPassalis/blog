import type { typeComments } from '@/lib/postgres/data/type'

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { zodCommentClient } from '@/lib/postgres/data/zod'
import { envServer } from '@/data/env/envServer'
import axios, { isAxiosError } from 'axios'
import { postgres } from '@/lib/postgres'
import { blog_posts } from '@/lib/postgres/schema'
import { eq } from 'drizzle-orm'
// import { redis } from '@/lib/redis'

export const routeUserBlogComment = new Hono().post(
  '/',
  zValidator('json', z.object({ comment: zodCommentClient }), (result, c) => {
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const { comment } = c.req.valid('json')
    const createdAt = new Date()

    // const redisKey = '/user/blog/comment'
    // try {
    //   const updateQueue = await redis.get(redisKey)
    //   await redis.set(
    //     redisKey,
    //     updateQueue
    //       ? JSON.stringify([
    //           ...JSON.parse(updateQueue),
    //           { createdAt: createdAt, comment: comment },
    //         ])
    //       : JSON.stringify([{ createdAt: createdAt, comment: comment }])
    //   )
    // } catch (error) {
    //   console.error(error) // NEEDS FIXING

    //   return c.json(null, 500)
    // }

    try {
      const res = await axios.post(
        `${envServer.N8N_WEBHOOK_URL}/user/blog/comment`,
        {
          comment: comment.comment,
        }
      )

      if (res.data.isToxic) {
        return c.json({ message: 'isToxic' }, 200)
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.message)
      } else {
        console.error(error) // NEEDS FIXING
      }

      return c.json(null, 500)
    }

    let existingComments: typeComments = [] // NEEDS FIXING race conditions are possible, maybe try to solve using redis
    try {
      const array = await postgres
        .select({ comments: blog_posts.comments })
        .from(blog_posts)
        .where(eq(blog_posts.title, comment.title))
        .limit(1)

      existingComments = array[0].comments
    } catch (error) {
      console.error(error)
    }

    try {
      await postgres
        .update(blog_posts)
        .set({
          comments: [
            ...existingComments,
            {
              created_at: createdAt,
              name: comment.name,
              comment: comment.comment,
            },
          ],
        })
        .where(eq(blog_posts.title, comment.title))
    } catch (error) {
      console.error(error)
    }

    return c.json({ response: 'response' }, 200)
  }
)
