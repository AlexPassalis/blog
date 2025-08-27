import type { typeBlog } from '@/lib/postgres/data/type'

import { postgres } from '@/lib/postgres/index'
import { blog_posts } from '@/lib/postgres/schema/index'
import { redis } from '@/lib/redis'
import { eq } from 'drizzle-orm'
import { useLoaderData } from 'react-router'
import { Link } from 'react-router'

export const redisBlogKey = 'blog'

export async function loader() {
  let redisBlog
  try {
    redisBlog = await redis.get(redisBlogKey)
  } catch (error) {
    console.error(error)
    // do not return, so that postgres can continue serving, if redis is down.
  }

  let blog
  if (redisBlog) {
    blog = JSON.parse(redisBlog) as typeBlog
  } else {
    try {
      blog = await postgres
        .select()
        .from(blog_posts)
        .where(eq(blog_posts.is_published, true))

      void redis
        .set(redisBlogKey, JSON.stringify(blog), 'EX', 3600)
        .catch((error) => {
          console.error(error)
        })
    } catch (error) {
      console.error(error)
      throw new Response(null, {
        status: 500,
      })
    }
  }

  return { blog }
}

export default function Page() {
  const { blog } = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col gap-6">
      {blog.map((blog_post, index) => {
        return (
          <Link
            key={index}
            to={`/blog/${blog_post.title}`}
            className="text-white h-60 p-4 rounded-md bg-blue-600 shadow-[0_10px_15px_rgba(0,0,0,0.3),0_4px_6px_rgba(0,0,0,0.2)]"
          >
            <section className="line-clamp-7">
              <h1 className="text-lg text-center mb-8">{blog_post.title}</h1>
              <p>{blog_post.content_description}</p>
            </section>
          </Link>
        )
      })}
    </div>
  )
}
