import type { typeApi } from '../../../../hono/src/api/index'

import { hc } from 'hono/client'
import { envClient } from '@/data/env/envClient'

export const hono = hc<typeApi>(envClient.HONO_URL)
