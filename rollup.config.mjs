import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [{
  input: 'src/index.mjs',
  output: [{
    file: 'dist/y-nostr.js',
    format: 'esm',
    name: 'y-nostr',
    sourcemap: true
  }, {
    file: 'demo/y-nostr.js',
    format: 'esm',
    name: 'y-nostr',
    sourcemap: true
  }],
  plugins: [
    commonjs(),
    nodeResolve({
      dedupe: 'yjs'
    })
  ]
}]
