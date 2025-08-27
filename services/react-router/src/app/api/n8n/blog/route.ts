// import { Hono } from 'hono'
// import { z } from 'zod'
// import { zValidator } from '@hono/zod-validator'
// import { zodBlogPostClient } from '@/lib/postgres/data/zod'
// import { postgres } from '@/lib/postgres'
// import { blog_posts } from '@/lib/postgres/schema'

// export const routeN8nBlog = new Hono().post(
//   '/',
//   zValidator('json', z.object({ blogPost: zodBlogPostClient }), (result, c) => {
//     if (!result.success) {
//       return c.json(
//         { message: 'Invalid request', error: result.error.issues },
//         400
//       )
//     }
//   }),
//   async (c) => {
//     const { blogPost } = c.req.valid('json')

//     try {
//       await postgres.insert(blog_posts).values(blogPost)
//     } catch (error) {
//       console.error(error)
//       return c.json({ message: 'Postgres error', error: error }, 500) // NEEDS FIXING maybe I should not return the error, could be dangerous
//     }

//     return c.json(null, 200)
//   }
// )
