import { nodeResolve } from '@rollup/plugin-node-resolve'
// import nodePolyfills from 'rollup-plugin-polyfill-node'
import commonjs from '@rollup/plugin-commonjs'
// import builtins from 'rollup-plugin-node-builtins'
// import globals from 'rollup-plugin-node-globals'
import alias from '@rollup/plugin-alias'

export default [
  {
    input: 'src/y-ndk.mjs',
    output: [{
      file: 'dist/y-ndk.mjs',
      format: 'esm',
      name: 'yndk',
      sourcemap: true
    }],
    plugins: [
      commonjs(),
      nodeResolve({
        skip: ['yjs', 'crypto']
      })
    ]
  },
  {
    input: 'src/y-ndk.mjs',
    output: [{
      file: 'demo/y-ndk.mjs',
      format: 'esm',
      name: 'yndk',
      sourcemap: true
    }],
    plugins: [
      commonjs(),
      nodeResolve()
    ]
  },
  {
    input: 'demo/demo.mjs',
    output: [{
      file: 'demo/index.mjs',
      format: 'esm',
      name: 'yndk',
      sourcemap: true
    }],
    plugins: [
      // nodePolyfills(),
      nodeResolve(
        {
          mainFields: ['module', 'browser', 'main']
        },
        alias({
          entries: [
            {
              find: 'yjs',
              replacement: './node_modules/yjs/dist/yjs.mjs'
            }
          ]
        })
      )
    ]
  }
]
