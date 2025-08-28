import { zodUser, zodBlog } from '@/data/zod/models'

export const zodUserWrite = zodUser
export const zodUserLogin = zodUser.pick({ email: true, password: true })

export const zodBlogWrite = zodBlog.pick({ title: true, content: true })
