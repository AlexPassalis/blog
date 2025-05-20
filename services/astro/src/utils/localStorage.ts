import type { typeBlogPostTitle } from '@/lib/postgres/data/type'

type typeLocalStorageBlogPosts = typeBlogPostTitle[]

const BLOG_POSTS_KEY = 'blog_posts'

export function getLocalStorageBlogPosts(title: typeBlogPostTitle) {
  const blogPosts = localStorage.getItem(BLOG_POSTS_KEY)
  if (blogPosts) {
    const blogPostsParsed = JSON.parse(blogPosts) as typeLocalStorageBlogPosts
    if (!blogPostsParsed.includes(title)) {
      console.info('Make HTTP request to add blog visit')
    }
  }
}
