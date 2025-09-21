'use client'

import type { paths } from '@/lib/openapi-typescript/schema'

export type typeBlogs =
  paths['/api/blogs/']['get']['responses']['200']['content']['application/json']

import { useEffect, useState } from 'react'
import { fetchClient } from '@/lib/openapi-fetch/client'
import { CreateBlogForm } from '@/app/blogs/[author]/CreateBlogForm'

type typePageClientProps = {
  blogs: typeBlogs
  accessToken: undefined | string
}

export function PageClient({
  blogs: apiBlogs,
  accessToken,
}: typePageClientProps) {
  const [blogs, setBlogs] = useState(apiBlogs)

  const fetchClientInstance = fetchClient

  useEffect(() => {
    if (accessToken) {
      fetchClientInstance.use({
        onRequest: async ({ request }) => {
          request.headers.set('Authorization', `Bearer ${accessToken}`)
        },
      })
    }

    ;(async () => {
      try {
        const { error: firstError } = await fetchClientInstance.POST(
          '/api/auth/token/refresh/',
        )
        if (firstError) {
          return
        } // NEEDS FIXING i do not think I need to do anything. It just means that the user has not logged in, so unauthenticated error.

        fetchClientInstance.use({
          onRequest: async ({ request }) => {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
          },
        })

        const { error: secondError, data } = await fetchClientInstance.GET(
          '/api/blogs/',
        )
        if (secondError) {
          throw new Error() // it will get caught by the try-catch block.
        }

        setBlogs(data)
      } catch (err) {
        console.error(err)
        // NEEDS FIXING do something to indicate that there was a (probably) network error
      }
    })()

    fetchClientInstance.use({
      onRequest: async ({ request }) => {
        request.headers.set('Authorization', `Bearer ${accessToken}`)
      },
    })
  }, [])

  return (
    <main className="p-8">
      {blogs.map(({ id, title, author, content }, index, array) => (
        <section
          key={id}
          className={`text-black bg-white w-1/3 mx-auto p-4 rounded-lg ${
            index + 1 !== array.length ? 'mb-4' : ''
          }`}
        >
          <h1 className="text-center text-3xl">{title}</h1>
          <h2 className="text-2xl">{author}</h2>
          <p>{content}</p>
        </section>
      ))}
      <CreateBlogForm
        fetchClient={fetchClientInstance}
        setBlogs={setBlogs}
        className="mt-8"
      />
    </main>
  )
}
