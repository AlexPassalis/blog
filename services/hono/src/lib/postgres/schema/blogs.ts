import type { typeOutline, typeComments } from '../data/type'

import {
  pgSchema,
  serial,
  boolean,
  text,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core'

export const blogsSchema = pgSchema('blogs')
export const blog_posts = blogsSchema.table('blog_posts', {
  id: serial('id').primaryKey(),
  is_published: boolean('is_published').notNull().default(false),
  title: text('title').notNull(),
  content_description: text('content_description').notNull(),
  outline: jsonb('outline').$type<typeOutline>().notNull(),
  conclusion: text('conclusion').notNull(),
  image_description: text('image_description').notNull(),
  image_file: text('image_file'),
  unique_visitors: integer('unique_visitors').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  comments: jsonb('comments').$type<typeComments>().notNull().default([]),
})
