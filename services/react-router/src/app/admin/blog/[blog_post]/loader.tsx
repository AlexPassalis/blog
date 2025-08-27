import type { Route } from '../../../+types/page'

import { postgres } from '@/lib/postgres/index'
import { blog_posts } from '@/lib/postgres/schema/index'
import { eq } from 'drizzle-orm'

export async function loader({ params }: Route.LoaderArgs) {
  const blog_post = params.blog_post as string

  let blogPost
  try {
    const array = await postgres
      .select()
      .from(blog_posts)
      .where(eq(blog_posts.title, blog_post))

    if (array.length < 1) {
      throw new Response(null, {
        status: 400,
      })
    }

    blogPost = array[0]
  } catch (error) {
    console.error(error)
    throw new Response(null, {
      status: 500,
    })
  }

  return { blogPost }
}
