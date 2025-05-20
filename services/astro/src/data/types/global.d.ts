/// <reference path="../.astro/types.d.ts" />

import type { Handler } from '@astrojs/node'

declare module './dist/server/entry.mjs' {
  export const handler: Handler
}

declare namespace App {
  interface Locals {
    user: import('better-auth').User | null
    session: import('better-auth').Session | null
  }
}
