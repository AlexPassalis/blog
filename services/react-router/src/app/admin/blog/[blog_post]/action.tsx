import type { ActionFunctionArgs } from 'react-router'
import type { typeBlog } from '@/lib/postgres/data/type'

import { isAdminApi } from '@/lib/better-auth/is'
import { sanitizeFilename } from '@/utils/sanitize'
import { uploadFile } from '@/lib/minio'
import { envServer } from '@/data/env/envServer'
import { postgres } from '@/lib/postgres/index'
import { blog_posts } from '@/lib/postgres/schema/index'
import { eq } from 'drizzle-orm'
import { redis } from '@/lib/redis/index'
import { redisBlogKey } from '@/app/(user)/blog/page'

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === 'POST') {
    await isAdminApi(request)

    const formData = await request.formData()
    const blog_post_title = formData.get('blog_post_title') as null | string
    const image_file = formData.get('image_file') as null | File
    if (!blog_post_title || !image_file) {
      return Response.json(
        { ok: false, message: 'invalid request', error: 'no file uploaded' },
        { status: 400 }
      )
    }

    const image_file_name = sanitizeFilename(image_file.name)

    try {
      await uploadFile(
        envServer.MINIO_FOLDER_BLOG_POSTS,
        image_file,
        image_file_name
      ) // NEEDS FIXING now every time a new file gets uploaded, the old one does not get removed.
    } catch (error) {
      console.error(error)
      return Response.json(
        { ok: false, message: 'internal server error' },
        { status: 500 }
      )
    }

    let postgres_blog_post
    try {
      const [row] = await postgres
        .update(blog_posts)
        .set({ image_file: image_file_name })
        .where(eq(blog_posts.title, blog_post_title))
        .returning()

      postgres_blog_post = row
    } catch (error) {
      console.error(error)
      return Response.json(
        { ok: false, message: 'internal server error' },
        { status: 500 }
      )
    }

    try {
      await redis.set(
        blog_post_title,
        JSON.stringify(postgres_blog_post),
        'EX',
        3600
      )

      const redisBlog = await redis.get(redisBlogKey)
      if (redisBlog) {
        const redisBlogParsed = JSON.parse(redisBlog) as typeBlog
        const updatedBlog = redisBlogParsed.map((blog_post) =>
          blog_post.title === blog_post_title ? postgres_blog_post : blog_post
        )
        if (updatedBlog.length > 0) {
          await redis.set(redisBlogKey, JSON.stringify(updatedBlog))
        } else {
          await redis.del(redisBlogKey)
        }
      }
    } catch (error) {
      console.error(error)
      return Response.json(
        { ok: false, message: 'internal server error' },
        { status: 500 }
      )
    }

    return Response.json({ ok: true }, { status: 200 })
  } else {
    return Response.json(
      { ok: false, message: 'invalid request', error: 'invalid method' },
      { status: 400 }
    )
  }
}
