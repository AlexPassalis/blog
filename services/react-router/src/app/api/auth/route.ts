import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router'

import { authServer } from '@/lib/better-auth/server'

export async function loader({ request }: LoaderFunctionArgs) {
  return authServer.handler(request)
}

export async function action({ request }: ActionFunctionArgs) {
  return authServer.handler(request)
}
