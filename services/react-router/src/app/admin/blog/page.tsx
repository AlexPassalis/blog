import classes from '@/app/css/mantineErrorNotifications.module.css'

import type { typeBlog } from '@/lib/postgres/data/type'
import type { ActionFunctionArgs } from 'react-router'

import { postgres } from '@/lib/postgres/index'
import { blog_posts } from '@/lib/postgres/schema/index'

import { useLoaderData, useFetcher } from 'react-router'
import { useEffect, useState, useRef } from 'react'
import { notifications } from '@mantine/notifications'
import { FaCircleCheck } from 'react-icons/fa6'
import { Switch } from '@mantine/core'
import { envClient } from '@/data/env/envClient'

import { isAdminApi } from '@/lib/better-auth/is'
import { z } from 'zod'
import { zodBlogPostTitle } from '@/lib/postgres/data/zod'
import { redis } from '@/lib/redis'
import { redisBlogKey } from '@/app/(user)/blog/page'
import { not, and, eq, isNotNull } from 'drizzle-orm'

export async function loader() {
  let blog
  try {
    blog = await postgres.select().from(blog_posts)
  } catch (error) {
    console.error(error)
    throw new Response(null, {
      status: 500,
    })
  }

  return { blog }
}

export default function Page() {
  const { blog } = useLoaderData<typeof loader>()

  const [isPublished, setIsPublished] = useState(
    blog.map((blog_post) => blog_post.is_published)
  )

  const [lastToggled, setLastToggled] = useState<null | {
    title: string
    index: number
  }>(null)
  const notificationRef = useRef<string | null>(null)
  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      notificationRef.current = notifications.show({
        loading: true,
        title: 'Updating is_published state for blog_post:',
        message: `"${lastToggled?.title}"`,
        autoClose: false,
        withCloseButton: false,
      })
    }
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.ok) {
        setIsPublished((prev) =>
          prev.map((is_published, index) =>
            index === lastToggled!.index ? !is_published : is_published
          )
        )
        notifications.update({
          id: notificationRef.current!,
          loading: false,
          title: 'Successfully updated is_published state for blog_post:',
          message: `"${lastToggled?.title}"`,
          autoClose: 2000,
          withCloseButton: false,
          icon: <FaCircleCheck size={30} color="green" />,
          color: 'white',
        })
      } else {
        notifications.update({
          id: notificationRef.current!,
          loading: false,
          title: `Failed to update is_published state for blog_post: "${lastToggled?.title}"`,
          message: fetcher.data?.error
            ? `message: ${fetcher.data.message} error: ${fetcher.data.error}`
            : `message: ${fetcher.data.message}`,
          autoClose: false,
          withCloseButton: true,
          color: 'red',
          classNames: classes,
        })
      }
      setLastToggled(null)
    }
  }, [fetcher.state])

  return (
    <div className="border border-black rounded-md p-4">
      {blog.map((blog_post, index, arr) => (
        <div
          key={index}
          className={`${
            index !== arr.length - 1 ? 'mb-4' : ''
          } flex items-center`}
        >
          <Switch
            checked={isPublished[index]}
            disabled={fetcher.state !== 'idle'}
            onClick={async () => {
              setLastToggled({ title: blog_post.title, index: index })
              await fetcher.submit(
                { blog_post_title: blog_post.title },
                { method: 'POST', encType: 'application/json' }
              )
            }}
            size="sm"
            onLabel="on"
            offLabel="off"
            color="green"
            className="mr-4"
          />
          <a
            href={`${envClient.ADMIN_URL}/blog/${blog_post.title}`}
            className="text-lg hover:text-blue-600"
          >
            {blog_post.title}
          </a>
        </div>
      ))}
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === 'POST') {
    await isAdminApi(request)

    const body = await request.json()
    const { error, data: validatedBody } = z
      .object({ blog_post_title: zodBlogPostTitle })
      .safeParse(body)
    if (error) {
      return Response.json(
        {
          ok: false,
          message: 'invalid request',
          error: error.issues.toString(),
        },
        { status: 400 }
      )
    }

    const { blog_post_title } = validatedBody

    let updatedIsPublished
    let blog_post
    try {
      const array = await postgres
        .update(blog_posts)
        .set({ is_published: not(blog_posts.is_published) })
        .where(
          and(
            eq(blog_posts.title, blog_post_title),
            isNotNull(blog_posts.image_file)
          )
        )
        .returning()

      if (array.length > 0) {
        const [row] = array
        updatedIsPublished = row.is_published
        blog_post = row
      } else {
        return Response.json(
          {
            ok: false,
            message: `The "${blog_post_title}" blog_post does not have an image_file.`,
          },
          { status: 422 }
        )
      }
    } catch (error) {
      console.error(error)
      return Response.json(
        { ok: false, message: 'internal server error' },
        { status: 500 }
      )
    }

    try {
      const redisBlog = await redis.get(redisBlogKey)

      if (!updatedIsPublished) {
        await redis.del(blog_post_title)
        if (redisBlog) {
          const redisBlogParsed = JSON.parse(redisBlog) as typeBlog
          const updatedBlog = redisBlogParsed.filter(
            (blog_post) => blog_post.title !== blog_post_title
          )
          if (updatedBlog.length > 0) {
            await redis.set(redisBlogKey, JSON.stringify(updatedBlog))
          } else {
            await redis.del(redisBlogKey)
          }
        }
      } else {
        if (redisBlog) {
          const redisBlogParsed = JSON.parse(redisBlog) as typeBlog
          const updatedBlog = [...redisBlogParsed, blog_post]
          await redis.set(redisBlogKey, JSON.stringify(updatedBlog))
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
