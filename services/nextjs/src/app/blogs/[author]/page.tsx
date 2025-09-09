import { cookies } from 'next/headers'
import { fetchServer } from '@/lib/openapi-fetch/server'
import { PageClient } from '@/app/blogs/[author]/PageClient'

type typePageProps = {
  params: Promise<{ author: string }>
}

export default async function Page({ params }: typePageProps) {
  const [{ author }, cookieStore] = await Promise.all([params, cookies()])

  const accessToken = cookieStore.get('access')?.value
  if (accessToken) {
    fetchServer.use({
      onRequest: async ({ request }) => {
        request.headers.set('Authorization', `Bearer ${accessToken}`)
      },
    })
  }

  const { error, data } = await fetchServer.GET('/api/blogs/{username}/', {
    params: { path: { username: author } },
  })
  if (error) {
    console.error(error)
    throw new Error()
  }

  return <PageClient blogs={data} accessToken={accessToken} />
}
