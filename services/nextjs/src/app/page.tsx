import { fetchServer } from '@/lib/openapi-fetch/server'
import { CreateBlogForm } from '@/app/CreateBlogForm'

export default async function Home() {
  const { error, data } = await fetchServer.GET('/api/blogs/')
  if (error) {
    console.error(error)
    throw new Error('Failed to load blogs.')
  }

  console.log(data)

  return (
    <main>
      {data.map((blog, index) => (
        <section key={index}>
          <h1>{blog.title}</h1>
          <h2>{blog.author}</h2>
        </section>
      ))}
      <CreateBlogForm />
    </main>
  )
}
