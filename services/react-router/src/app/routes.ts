import type { RouteConfig } from '@react-router/dev/routes'

import { index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  layout('./(user)/layout.tsx', [
    index('./page.tsx'),
    ...prefix('blog', [
      route('/', './(user)/blog/page.tsx'),
      route(':blog_post', './(user)/blog/[blog_post]/page.tsx'),
    ]),
  ]),
  layout('./admin/layout.tsx', [
    ...prefix('admin', [
      ...prefix('blog', [
        route('/', './admin/blog/page.tsx'),
        route(':blog_post', './admin/blog/[blog_post]/page.tsx'),
      ]),
    ]),
  ]),
  ...prefix('api', [
    ...prefix('user', [
      route('newsletter/email', './api/user/newsletter/email/route.ts'),
      route('blog_post/comment', './api/user/blog_post/comment/route.ts'),
    ]),
    ...prefix('auth', [route('*', './api/auth/route.ts')]),
    ...prefix('n8n', [route('blog', './api/n8n/blog/route.ts')]),
  ]),
] satisfies RouteConfig
