import { fetchServer } from '@/lib/openapi-fetch/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const [{ error, data }, cookieStore] = await Promise.all([
    fetchServer.GET('/api/blogs/'),
    cookies(),
  ])
  if (error) {
    console.error(error)
    throw new Error('GET /api/blogs/ from @/app/page.tsx failed.')
  }

  const accessToken = cookieStore.get('access')?.value
  console.log(accessToken)

  return (
    <main className="p-8">
      {data.map(({ id, title, author, content }, index, array) => (
        <section
          key={id}
          className={`text-black bg-white w-1/3 mx-auto p-4 rounded-lg ${
            index + 1 !== array.length ? 'mb-4' : ''
          }`}
        >
          <h1 className="text-center text-3xl">{title}</h1>
          <h2 className="text-2xl">{author}</h2>
          <p>{content}</p>
        </section>
      ))}
    </main>
  )
}
