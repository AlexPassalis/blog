import createClient from 'openapi-fetch'
import type { paths } from '@/lib/openapi-typescript/schema'
import { BASE_URL_CLIENT } from '@/data/env/client'

export const fetchClient = createClient<paths>({
  baseUrl: BASE_URL_CLIENT,
})
