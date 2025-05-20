import type {
  typeBlogPostIsPublished,
  typeBlogPostTitle,
} from '@/lib/postgres/data/type'

import { useState } from 'react'
import { hono } from '@/lib/hono'

type IsPublishedButtonProps = {
  title: typeBlogPostTitle
  is_published: typeBlogPostIsPublished
}

export function IsPublishedButton({
  title,
  is_published,
}: IsPublishedButtonProps) {
  const [isPublished, setIsPublished] = useState(is_published)

  return (
    <button
      onClick={async () => {
        const res = await hono.api.admin.blog.is_published.$post({
          json: { title: title, is_published: isPublished },
        })

        if (res.status === 500) {
          window.location.href = '/500'
        } else {
          setIsPublished((prev) => !prev)
        }
      }}
      className={`w-3 h-3 rounded-full mx-2 ${isPublished ? 'bg-green-600' : 'bg-red-600'} hover:cursor-pointer hover:border hover:border-black`}
    />
  )
}
