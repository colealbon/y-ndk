import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  NostrProvider,
  createNostrCRDTRoom
} from './y-ndk.mjs'

import {
  NOSTR_RELAY,
  PRIVATE_NOSTR_ROOM_KEY,
  YJS_UPDATE_EVENT_KIND
} from './magic.mjs'

export const defaultNostrRoomPayload = () => ({
  'nostr-event-kind': YJS_UPDATE_EVENT_KIND.toString(),
  'nostr-relay': NOSTR_RELAY.toString(),
  'private-nostr-room-key': PRIVATE_NOSTR_ROOM_KEY.toString()
})

export const demoCreateNostrRoom = async (params) => {
  const {
    relay,
    privateNostrRoomKey
  } = params
  const roomOpts = {}
  const skSigner = new NDKPrivateKeySigner(privateNostrRoomKey)
  roomOpts.signer = skSigner
  roomOpts.explicitRelayUrls = [relay]
  roomOpts.activeUser = skSigner.user()
  const roomNdk = new NDK(roomOpts)
  await roomNdk.connect()
  const ydoc = new yjs.Doc()
  const initialLocalStateRoom = yjs.encodeStateAsUpdate(ydoc)
  const nostrCRDTCreateEventId = await createNostrCRDTRoom(
    roomNdk,
    'testWebApp',
    initialLocalStateRoom,
    YJS_UPDATE_EVENT_KIND
  )
  return Promise.resolve(nostrCRDTCreateEventId)
}
export const demoCreateNostrProvider = async (params) => {
  const {
    relay,
    roomId
  } = params
  const aliceOpts = {}
  const aliceYdoc = new yjs.Doc()
  aliceOpts.explicitRelayUrls = relay
  const alicePrivateKey = 'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
  const aliceSigner = new NDKPrivateKeySigner(alicePrivateKey)
  const alicePubkey = (await aliceSigner.user()).pubkey
  aliceOpts.signer = aliceSigner
  aliceOpts.activeUser = aliceSigner.user()
  aliceOpts.explicitRelayUrls = relay
  const aliceNdk = new NDK(aliceOpts)
  await aliceNdk.connect()
  const nostrProviderAlice = new NostrProvider(
    aliceYdoc,
    roomId,
    aliceNdk,
    alicePubkey,
    YJS_UPDATE_EVENT_KIND
  )
  nostrProviderAlice.initialize()

  const bobPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
  const bobSigner = new NDKPrivateKeySigner(bobPrivateKey)
  const bobPubkey = (await bobSigner.user()).pubkey
  const bobOpts = {}
  bobOpts.signer = bobSigner
  bobOpts.activeUser = bobSigner.user()
  bobOpts.explicitRelayUrls = relay
  const bobNdk = new NDK(bobOpts)
  await bobNdk.connect()
  const bobYdoc = new yjs.Doc()
  const nostrProviderBob = new NostrProvider(
    bobYdoc,
    roomId,
    bobNdk,
    bobPubkey,
    YJS_UPDATE_EVENT_KIND
  )
  nostrProviderBob.initialize()
  aliceYdoc.getMap('test').set('contents', new yjs.Text('it worked! this is hello via nostr'))
  await new Promise((resolve) => setTimeout(resolve, 500))
  const bobReceive = bobYdoc.getMap('test').get('contents')?.toJSON()
  return bobReceive
}
