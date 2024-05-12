import { nodeResolve } from '@rollup/plugin-node-resolve'

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
    nodeResolve({
      dedupe: 'yjs'
    })
  ]
}]
