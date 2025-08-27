import type { LoaderFunctionArgs } from 'react-router'

import { isAdmin } from '@/lib/better-auth/is'
import { Outlet } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  await isAdmin(request)
}

export default function UserLayout() {
  return (
    <>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  )
}
