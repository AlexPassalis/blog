import type { ActionFunctionArgs } from 'react-router'

import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { emails } from '@/lib/postgres/schema/index'
import { isPgError } from '@/utils/isPgError'

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === 'POST') {
    const body = await request.json()
    const { error, data: validatedBody } = z
      .object({ email: z.string().email() })
      .safeParse(body)
    if (error) {
      return new Response(
        JSON.stringify({ message: 'invalid request', error: error.issues }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    const { email } = validatedBody

    try {
      await postgres.insert(emails).values({ email: email })
    } catch (error) {
      if (isPgError(error) && error.code === '23505') {
        return new Response(JSON.stringify({ message: 'success' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      console.error(error)
      return new Response(JSON.stringify({ message: 'server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'success' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    return new Response(
      JSON.stringify({
        message: 'invalid request',
        error: 'method',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
