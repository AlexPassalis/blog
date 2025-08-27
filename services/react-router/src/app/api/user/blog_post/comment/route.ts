import type { ActionFunctionArgs } from 'react-router'

import { z } from 'zod'

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === 'POST') {
    const body = await request.json()
    const { error, data: validatedBody } = z
      .object({ comment: z.string() })
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
    const { comment } = validatedBody

    console.info(comment)

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
