import { nodeResolve } from '@rollup/plugin-node-resolve'
// import { alias } from '@rollup/plugin-alias'
// import builtins from 'rollup-plugin-node-builtins'
// import globals from 'rollup-plugin-node-globals'
// import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './demo.js',
  external: ['yjs'],
  output: {
    file: './index.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectories: ['./node_modules']
      }
    // ,
    // alias({
    //   entries: [
    //     {
    //       find: 'yjs',
    //       replacement: './node_modules/yjs/dist/yjs.mjs'
    //     }
    //   ]
    // }),
    })
  ]

  //,
  // indicate which modules should be treated as external
  // external: ['yjs']
  // plugins: [
  //   nodeResolve({
  //     ignoreGlobal: false,
  //     include: ['node_modules/**'],
  //     skip: ['yjs', 'nostr-tools']
  //   })
  // ],
  // resolveExternal: function ( id ) {
  //   return path.resolve( __dirname, id);
  // }
}
