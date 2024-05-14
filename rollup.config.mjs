import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import alias from '@rollup/plugin-alias'

export default [
  {
    input: 'src/y-ndk.mjs',
    output: [{
      file: 'dist/y-ndk.mjs',
      format: 'esm',
      name: 'y-ndk',
      sourcemap: true
    }],
    plugins: [
      commonjs(),
      nodeResolve({
        skip: ['yjs']
      })
    ]
  },
  {
    input: 'src/y-ndk.mjs',
    output: [{
      file: 'demo/y-ndk.mjs',
      format: 'esm',
      name: 'y-nndk',
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
      name: 'y-ndk-demo',
      sourcemap: true
    }],
    plugins: [
      commonjs(),
      nodeResolve(
        alias({
          entries: [
            {
              find: 'yjs',
              replacement: './node_modules/yjs/dist/yjs.mjs'
            }
          ]
        })
      ),
      builtins(),
      globals()
    ]
  }
]
