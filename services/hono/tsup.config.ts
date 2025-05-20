import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'build',
  target: 'node20',
  esbuildOptions(options) {
    options.banner = {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    }
  },
  onSuccess: 'node build/index.js',
})
