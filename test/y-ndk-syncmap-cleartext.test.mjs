import * as testing from 'lib0/testing'
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { WebSocket } from 'ws'
import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  NostrProvider,
  createNostrCRDTRoom
} from '../src/y-ndk.mjs'

import {
  YJS_UPDATE_EVENT_KIND
} from './magic.mjs'

global.WebSocket = WebSocket
const TEST_NOSTR_RELAYS = ['ws://0.0.0.0:4444']

export const testSyncMapCleartext = async tc => {
  const ndkOptsAlice = {}
  const senderAliceSecretNostrKeyBytes = generateSecretKey()
  const senderAlicePublicNostrKeyHex = getPublicKey(senderAliceSecretNostrKeyBytes)
  const skSignerAlice = new NDKPrivateKeySigner(senderAliceSecretNostrKeyBytes)
  ndkOptsAlice.explicitRelayUrls = TEST_NOSTR_RELAYS
  ndkOptsAlice.signer = skSignerAlice
  const ndkAlice = new NDK(ndkOptsAlice)
  await ndkAlice.connect()
  const aliceYdoc = new yjs.Doc()
  const initialLocalStateAlice = yjs.encodeStateAsUpdate(aliceYdoc)

  const nostrCRDTCreateEventId = await createNostrCRDTRoom({
    ndk: ndkAlice,
    label: 'crdtroom',
    initialLocalState: initialLocalStateAlice,
    YJS_UPDATE_EVENT_KIND,
    secretNostrKey: senderAliceSecretNostrKeyBytes,
    explicitRelayUrls: TEST_NOSTR_RELAYS
  })
  // confirm the nostr relay "create room" event exists
  const roomEvent = await new Promise((resolve) => {
    const sub = ndkAlice.subscribe({
      id: nostrCRDTCreateEventId,
      since: Math.floor(Date.now() / 1000) - 1
    }, {
      closeOnEose: false
    })
    sub.on('event', (event) => {
      resolve(event)
    })
  })

  testing.compare(roomEvent.pubkey, senderAlicePublicNostrKeyHex, 'objects are equal')

  const nostrProviderAlice = new NostrProvider(
    {
      yjs,
      ydoc: aliceYdoc,
      nostrRoomCreateEventId: roomEvent.id,
      ndk: ndkAlice,
      YJS_UPDATE_EVENT_KIND,
      secretNostrKey: senderAliceSecretNostrKeyBytes,
      explicitRelayUrls: TEST_NOSTR_RELAYS
    }
  )
  nostrProviderAlice.initialize()

  const ndkOptsBob = {}
  const receiverBobSecretNostrKeyBytes = generateSecretKey()
  // const receiverBobPublicNostrKeyHex = getPublicKey(receiverBobSecretNostrKeyBytes)
  const skSignerBob = new NDKPrivateKeySigner(receiverBobSecretNostrKeyBytes)
  ndkOptsBob.explicitRelayUrls = TEST_NOSTR_RELAYS
  ndkOptsBob.signer = skSignerBob
  const ndkBob = new NDK(ndkOptsBob)
  await ndkBob.connect()
  // await new Promise((resolve) => setTimeout(resolve, 2000))
  const bobYdoc = new yjs.Doc()

  const nostrProviderBob = new NostrProvider(
    {
      yjs,
      ydoc: bobYdoc,
      nostrRoomCreateEventId: roomEvent.id,
      ndk: ndkBob,
      YJS_UPDATE_EVENT_KIND,
      secretNostrKey: receiverBobSecretNostrKeyBytes,
      explicitRelayUrls: TEST_NOSTR_RELAYS
    }
  )
  nostrProviderBob.initialize()

  await aliceYdoc.getMap('test').set('contents', new yjs.Text('hello'))
  await new Promise((resolve) => setTimeout(resolve, 500))
  const bobReceive = bobYdoc.getMap('test').get('contents').toJSON()
  await testing.compare(bobReceive, 'hello', 'objects are equal')
  await bobYdoc.getMap('test').set('contents', new yjs.Text('goodbye'))
  await new Promise((resolve) => setTimeout(resolve, 500))
  const aliceReceive = aliceYdoc.getMap('test').get('contents').toJSON()
  await testing.compare(aliceReceive, 'goodbye', 'objects are equal')
}
