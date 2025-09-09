'use client'

import Link from 'next/link'

export default function Page() {
  return (
    <main className="flex-1 flex items-center justify-center h-screen text-black">
      <div className="flex flex-col items-center gap-4 border border-neutral-300 rounded-lg bg-white px-4 py-2">
        <h1 className="text-3xl">Error - 404</h1>
        <p className="text-xl">The page you searched for does not exist.</p>
        <span className="text-lg">
          Go to{' '}
          <Link
            href="/"
            className="text-blue-700 hover:underline underline-offset-4 hover:cursor-pointer"
          >
            home page
          </Link>
        </span>
      </div>
    </main>
  )
}
