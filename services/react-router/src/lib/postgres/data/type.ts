import type { blog_posts } from '../schema'

import type { InferSelectModel } from 'drizzle-orm'
import type { z } from 'zod'
import type {
  zodOutline,
  zodComments,
  zodBlogPostTitle,
  zodBlogPostIsPublished,
} from './zod'

export type typeOutline = z.infer<typeof zodOutline>
export type typeComments = z.infer<typeof zodComments>
export type typeBlogPostTitle = z.infer<typeof zodBlogPostTitle>
export type typeBlogPostIsPublished = z.infer<typeof zodBlogPostIsPublished>
export type typeBlogPost = InferSelectModel<typeof blog_posts>
export type typeBlog = typeBlogPost[]
