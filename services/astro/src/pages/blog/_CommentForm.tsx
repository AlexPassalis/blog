import { hono } from '@/lib/hono/index'
import { useRef, useState } from 'react'
import { zodCommentClient } from '@/lib/postgres/data/zod'
import type { typeComments } from '@/lib/postgres/data/type'

type CommentFormProps = {
  title: string
  comments: typeComments
}

export function CommentForm({
  title,
  comments: postgresComments,
}: CommentFormProps) {
  const [comments, setComments] = useState(postgresComments)
  console.info(setComments) // NEEDS FIXING

  const nameRef = useRef<null | HTMLInputElement>(null)
  const commentRef = useRef<null | HTMLInputElement>(null)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const { error, data: validatedComment } = zodCommentClient.safeParse({
          title: title,
          name: nameRef?.current?.value,
          comment: commentRef?.current?.value,
        })
        if (error) {
          return // NEEDS FIXING
        }

        const res = await hono.api.user.blog.comment.$post({
          json: {
            comment: validatedComment,
          },
        })
        console.info(res) // NEEDS FIXING
      }}
      className="flex flex-col gap-2"
    >
      {comments.map((comment, index) => (
        <div key={index}>
          <h1>{comment.comment}</h1>
          <h2>{comment.name}</h2>
          <h3>{String(comment.created_at)}</h3>
        </div>
      ))}

      <label htmlFor="name">Name</label>
      <input
        ref={nameRef}
        id="name"
        className="border border-black rounded-md p-2"
      />
      <label htmlFor="comment">Comment</label>
      <input
        ref={commentRef}
        id="comment"
        className="border border-black rounded-md p-2"
      />
      <button
        type="submit"
        className="border border-black rounded-md hover:cursor-pointer"
      >
        Submit Comment
      </button>
    </form>
  )
}
