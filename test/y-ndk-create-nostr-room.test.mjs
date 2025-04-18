import * as testing from 'lib0/testing'
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { WebSocket } from 'ws'
import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  createNostrCRDTRoom
} from '../src/y-ndk.mjs'

import {
  YJS_UPDATE_EVENT_KIND
} from './magic.mjs'

global.WebSocket = WebSocket
const TEST_NOSTR_RELAYS = ['ws://0.0.0.0:4444']

export const testCreateNostrRoom = async tc => {
  const ndkOpts = {}
  const testSecretNostrKeyBytes = generateSecretKey()
  const testPublicNostrKeyHex = getPublicKey(testSecretNostrKeyBytes)
  const skSigner = new NDKPrivateKeySigner(testSecretNostrKeyBytes)
  ndkOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
  ndkOpts.signer = skSigner
  const ndk = new NDK(ndkOpts)
  await ndk.connect()
  const ydoc = new yjs.Doc()
  const initialLocalState = yjs.encodeStateAsUpdate(ydoc)

  const nostrCRDTCreateEventId = await createNostrCRDTRoom({
    ndk,
    label: 'crdtroom',
    initialLocalState,
    YJS_UPDATE_EVENT_KIND,
    secretNostrKey: testSecretNostrKeyBytes,
    explicitRelayUrls: TEST_NOSTR_RELAYS
  })
  // confirm the nostr relay "create room" event exists
  const roomEvent = await new Promise((resolve) => {
    const sub = ndk.subscribe({
      id: nostrCRDTCreateEventId,
      since: Math.floor(Date.now() / 1000) - 1
    }, {
      closeOnEose: false
    })
    sub.on('event', (event) => {
      resolve(event)
    })
  })
  testing.compare(roomEvent.pubkey, testPublicNostrKeyHex, 'objects are equal')
}
