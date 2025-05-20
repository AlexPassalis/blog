import { readSecret } from './src/utils/readSecret'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: readSecret('BLOG_POSTGRES_URL'),
  },
  schemaFilter: ['auth', 'blogs'],
  schema: './src/lib/postgres/schema.ts',
  out: './src/lib/postgres/migrations',
  verbose: true,
  strict: true,
})
