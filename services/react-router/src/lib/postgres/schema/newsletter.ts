import { pgSchema, text } from 'drizzle-orm/pg-core'

export const newsletterSchema = pgSchema('newsletter')
export const emails = newsletterSchema.table('emails', {
  email: text('email').primaryKey(),
})
