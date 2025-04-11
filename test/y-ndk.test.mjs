import * as testing from 'lib0/testing'
import { WebSocket } from 'ws'
import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  NostrProvider,
  createNostrCRDTRoom
} from '../src/y-ndk.mjs'
import { NostrRelay } from './NostrRelay.mjs'
import {
  YJS_UPDATE_EVENT_KIND
} from './magic.mjs'

global.WebSocket = WebSocket
const nostrRelay = new NostrRelay(8080)
const TEST_NOSTR_RELAYS = ['ws://0.0.0.0:8080']
if (!nostrRelay) {
  console.log('no relay')
}

// export const testAlwaysPass = async tc => {
//   testing.compare(true, true, 'objects are equal')
// }

export const testCreateNostrRoom = async tc => {
  const ndkOpts = {}
  const PUBLIC_TEST_KEY = 'c753997e3b081c168288243bf61d35b20e1a64502a4305e4a6b33ace9fe20adc'
  const PRIVATE_TEST_KEY = 'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
  const skSigner = new NDKPrivateKeySigner(PRIVATE_TEST_KEY)
  ndkOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
  ndkOpts.signer = skSigner
  ndkOpts.activeUser = skSigner.user()
  const ndk = new NDK(ndkOpts)
  await ndk.connect()
  await new Promise(resolve => setTimeout(resolve, 2000))
  const ydoc = new yjs.Doc()
  const initialLocalState = yjs.encodeStateAsUpdate(ydoc)
  const nostrCRDTCreateEventId = await createNostrCRDTRoom(
    ndk,
    'TestCRDTLabel',
    initialLocalState,
    YJS_UPDATE_EVENT_KIND
  )
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
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
  testing.compare(roomEvent.pubkey, PUBLIC_TEST_KEY, 'objects are equal')
}

export const testSyncMap = async tc => {
  const aliceOpts = {}
  const aliceYdoc = new yjs.Doc()
  aliceOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
  const alicePrivateKey = 'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
  const aliceSigner = new NDKPrivateKeySigner(alicePrivateKey)
  const alicePubkey = (await aliceSigner.user()).pubkey
  aliceOpts.signer = aliceSigner
  aliceOpts.activeUser = aliceSigner.user()
  const aliceNdk = new NDK(aliceOpts)
  await aliceNdk.connect()
  // await new Promise(resolve => setTimeout(resolve, 5000))
  const initialLocalStateAlice = yjs.encodeStateAsUpdate(new yjs.Doc())
  const nostrRoomId = await createNostrCRDTRoom(
    aliceNdk,
    'testSyncYjsMap',
    initialLocalStateAlice,
    YJS_UPDATE_EVENT_KIND
  )

  const nostrProviderAlice = new NostrProvider(
    yjs,
    aliceYdoc,
    nostrRoomId,
    aliceNdk,
    alicePubkey,
    YJS_UPDATE_EVENT_KIND
  )
  nostrProviderAlice.initialize()
  const bobPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
  // const bobPubkey = getPublicKey(bobPrivateKey)
  const bobSigner = new NDKPrivateKeySigner(bobPrivateKey)
  const bobPubkey = (await bobSigner.user()).pubkey
  const bobOpts = {}
  bobOpts.signer = bobSigner
  bobOpts.activeUser = bobSigner.user()
  bobOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
  const bobNdk = new NDK(bobOpts)
  await bobNdk.connect()
  // await new Promise(resolve => setTimeout(resolve, 5000))
  const bobYdoc = new yjs.Doc()
  const nostrProviderBob = new NostrProvider(
    yjs,
    bobYdoc,
    nostrRoomId,
    bobNdk,
    bobPubkey,
    YJS_UPDATE_EVENT_KIND
  )
  nostrProviderBob.initialize()
  await aliceYdoc.getMap('test').set('contents', new yjs.Text('hello'))
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const bobReceive = bobYdoc.getMap('test').get('contents')?.toJSON()
  await testing.compare(bobReceive, 'hello', 'objects are equal')
}
