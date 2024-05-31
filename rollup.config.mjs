import { esbuildResolve } from 'rollup-plugin-esbuild-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    external: ['yjs', 'crypto', 'fs', 'path'], // [ 'sha256', '@noble/hashes'],
    input: 'src/y-ndk.mjs',
    output: [{
      file: 'dist/y-ndk.mjs',
      format: 'esm',
      name: 'yndk',
      sourcemap: true
    },
    {
      file: 'demo/y-ndk.mjs',
      format: 'esm',
      name: 'yndk',
      sourcemap: true
    }],
    plugins: [
      commonjs(),
      esbuildResolve()
    ]
  },
  {
    external: ['fs', 'path'],
    input: 'demo/demo.mjs',
    output: [{
      file: 'demo/bundle.mjs',
      format: 'esm',
      name: 'yndk',
      sourcemap: true
    }],
    plugins: [
      commonjs(),
      esbuildResolve({
        browser: true,
        alias: {
          yjs: 'yjs',
          crypto: 'crypto-js'
        }
      })
    ]
  }
]
