import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['index.ts'],
  format: 'esm',
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'dist'
})
