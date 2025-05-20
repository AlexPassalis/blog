import { defineConfig } from 'tsup'
import { envServer } from './src/data/env/envServer'

export default defineConfig({
  entry: ['src/lib/hono/index.ts'],
  format: ['esm'],
  target: 'node20',
  dts: envServer.ENVIRONMENT === 'production',
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.banner = {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    }
  },
  outDir: 'build',
  onSuccess: 'node build/index.js',
  external: ['./dist/server/entry.mjs'],
})
