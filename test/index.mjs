import { runTests } from 'lib0/testing'
import * as log from 'lib0/logging'
import * as ynostr from './y-nostr.test.mjs'
import { isBrowser, isNode } from 'lib0/environment.js'

if (isBrowser) {
  // optional: if this is ran in the browser, attach a virtual console to the dom
  log.createVConsole(document.body)
}

runTests({
  ynostr
}).then(success => {
  if (isNode) {
    process.exit(success ? 0 : 1)
  }
})
