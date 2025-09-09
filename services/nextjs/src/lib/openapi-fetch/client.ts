import type { paths } from '@/lib/openapi-typescript/schema'

import createClient from 'openapi-fetch'
import { BASE_URL_CLIENT } from '@/data/env/client'

export const fetchClient = createClient<paths>({
  baseUrl: BASE_URL_CLIENT,
})

export type typeFetchClient = typeof fetchClient
