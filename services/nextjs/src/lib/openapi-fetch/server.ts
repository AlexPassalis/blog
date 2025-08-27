import createClient from 'openapi-fetch'
import type { paths } from '@/lib/openapi-typescript/schema'
import { BASE_URL_SERVER } from '@/data/env/server'

export const fetchServer = createClient<paths>({ baseUrl: BASE_URL_SERVER })
