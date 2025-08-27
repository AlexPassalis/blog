import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'

import { blog_posts } from '../schema'

const zodChapter = z.object({
  title: z.string(),
  content: z.string(),
})
export const zodOutline = z.array(zodChapter)

export const zodBlogPost = createSelectSchema(blog_posts)
export const zodBlogPostClient = zodBlogPost.omit({
  id: true,
  is_published: true,
  image_file: true,
  unique_visitors: true,
  likes: true,
  comments: true,
})

export const zodBlogPostTitle = zodBlogPost.pick({ title: true }).shape.title
export const zodBlogPostIsPublished = zodBlogPost.pick({ is_published: true })
  .shape.is_published

export const zodComment = z.object({
  created_at: z.date(),
  name: z.union([z.null(), z.string()]),
  comment: z.string(),
})
export const zodComments = z.array(zodComment)
export const zodCommentClient = zodComment
  .omit({
    created_at: true,
  })
  .extend({ title: z.string() })
