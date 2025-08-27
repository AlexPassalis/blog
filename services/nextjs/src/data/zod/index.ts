import { zodUser } from '@/data/zod/models'

export const zodUserWrite = zodUser
export const zodUserLogin = zodUser.pick({ email: true, password: true })
