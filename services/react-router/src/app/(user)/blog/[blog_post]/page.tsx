import type { typeBlogPost } from '@/lib/postgres/data/type'
import type { Route } from '../../../+types/page'
import type { UserPageContext } from '@/app/(user)/layout'

import { redis } from '@/lib/redis/index'
import { postgres } from '@/lib/postgres/index'
import { blog_posts } from '@/lib/postgres/schema/index'
import { useLoaderData, useOutletContext } from 'react-router'
import { and, eq } from 'drizzle-orm'
import { envClient } from '@/data/env/envClient'
import { WSRV } from '@/lib/wsrv/index'
import { TextInput } from '@mantine/core'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
  const blog_post = params.blog_post as string

  let redisBlogPost
  try {
    redisBlogPost = await redis.get(blog_post)
  } catch (error) {
    console.error(error)
    // do not return, so that postgres can continue serving, if redis is down.
  }

  let blogPost
  if (redisBlogPost) {
    blogPost = JSON.parse(redisBlogPost) as typeBlogPost
  } else {
    let postgresBlogPost
    try {
      const array = await postgres
        .select()
        .from(blog_posts)
        .where(
          and(
            eq(blog_posts.title, blog_post),
            eq(blog_posts.is_published, true)
          )
        )
      postgresBlogPost = array[0]

      void redis
        .set(blog_post, JSON.stringify(postgresBlogPost), 'EX', 3600)
        .catch((error) => {
          console.error(error)
        })
    } catch (error) {
      console.error(error)
      throw new Response(null, {
        status: 500,
      })
    }

    if (postgresBlogPost) {
      blogPost = postgresBlogPost
    } else {
      throw new Response(null, {
        status: 404,
      })
    }
  }

  return { blogPost }
}

export default function Page() {
  const navigate = useNavigate()

  const { open, isLoggedIn } = useOutletContext<UserPageContext>()
  const { blogPost } = useLoaderData<typeof loader>()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      comment: '',
    },
    validate: zodResolver(
      z.object({
        comment: z
          .string()
          .min(1, { message: 'The comment must be at least 1 character long.' })
          .max(50, {
            message: 'The comment must be less than 50 characters long.',
          }),
      })
    ),
  })

  const [visible, { toggle }] = useDisclosure(false)

  return (
    <>
      <WSRV
        minio_folder={envClient.MINIO_FOLDER_BLOG_POSTS}
        image_file={blogPost.image_file || ''}
        alt={blogPost.image_description}
        width={640}
        height={640}
        className="mx-auto"
      />
      <h1 className="font-tagesschrift text-center text-2xl text-orange-500 mt-2 mb-4">
        {blogPost.title}
      </h1>
      <p className="text-lg mb-12">{blogPost.content_description}</p>
      {blogPost.outline.map((chapter, index) => (
        <div key={index} className="flex flex-col mb-10">
          <h2 className="text-center text-xl mb-2 text-blue-600">
            {chapter.title}
          </h2>
          <p>{chapter.content}</p>
        </div>
      ))}
      <h2 className="text-center text-xl mb-2 text-blue-600">Conclusion</h2>
      <p>{blogPost.conclusion}</p>
      <form
        onClick={() => {
          if (!isLoggedIn) {
            open()
          }
        }}
        onSubmit={form.onSubmit(async (values) => {
          try {
            toggle()
            const res = await fetch('/api/user/blog_post/comment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ comment: values.comment }),
            })
            if (!res.ok) {
              navigate('/500')
            } else {
              // NEEDS FIXING
            }
          } catch {
            throw new Response(null, {
              status: 500,
            })
          } finally {
            toggle()
          }
        })}
        className="relative flex flex-col gap-2"
      >
        <TextInput
          label="comment"
          placeholder="This is my comment."
          key={form.key('comment')}
          {...form.getInputProps('comment')}
        />
        <button
          type="submit"
          className="border border-black rounded-md hover:cursor-pointer"
        >
          Submit
        </button>
      </form>
    </>
  )
}
