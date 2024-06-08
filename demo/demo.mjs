import * as yjs from 'yjs'

import NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { NostrProvider, createNostrCRDTRoom } from './y-ndk.mjs'

import {
  NOSTR_RELAY,
  PRIVATE_NOSTR_ROOM_KEY,
  YJS_UPDATE_EVENT_KIND,
  magicTestKeys
} from './magic.mjs'

export const defaultNostrRoomPayload = () => ({
  'nostr-event-kind': YJS_UPDATE_EVENT_KIND.toString(),
  'nostr-relay': NOSTR_RELAY.toString(),
  'private-nostr-room-key': PRIVATE_NOSTR_ROOM_KEY.toString()
})

export const demoCreateNostrRoom = async (params) => {
  const { relay, privateNostrRoomKey } = params
  const ndkOpts = {}
  const skSigner = new NDKPrivateKeySigner(privateNostrRoomKey)
  ndkOpts.signer = skSigner
  ndkOpts.explicitRelayUrls = [relay]
  ndkOpts.activeUser = skSigner.user()
  const roomNdk = new NDK(ndkOpts)
  await roomNdk.connect()
  const ydoc = new yjs.Doc()
  const initialLocalStateRoom = yjs.encodeStateAsUpdate(ydoc)
  // const recipients = participants ? participants.map(recipient => recipient?.publicKey) : undefined
  // const encryptToSubscribers = passthrough => passthrough
  // const decryptForAlice = input => box.multibox_open(input, alice.secretKey)

  const nostrCRDTCreateEventId = await createNostrCRDTRoom(
    roomNdk,
    'testWebApp',
    initialLocalStateRoom,
    YJS_UPDATE_EVENT_KIND
  )
  return Promise.resolve(nostrCRDTCreateEventId)
}
export const demoRoundTripClearText = async (params) => {
  const { relay, roomId, simpleMessage } = params
  const aliceOpts = {}
  const aliceYdoc = new yjs.Doc()
  const alicePrivateKey =
    'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
  const aliceSigner = new NDKPrivateKeySigner(alicePrivateKey)
  const alicePubkey = (await aliceSigner.user()).pubkey
  aliceOpts.signer = aliceSigner
  aliceOpts.activeUser = aliceSigner.user()
  aliceOpts.explicitRelayUrls = [relay]
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

  const bobPrivateKey =
    '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
  const bobSigner = new NDKPrivateKeySigner(bobPrivateKey)
  const bobPubkey = (await bobSigner.user()).pubkey
  const bobOpts = {}
  bobOpts.signer = bobSigner
  bobOpts.activeUser = bobSigner.user()
  bobOpts.explicitRelayUrls = [relay]
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
  aliceYdoc.getMap('test').set('contents', new yjs.Text(simpleMessage))
  await new Promise((resolve) => setTimeout(resolve, 500))
  const bobReceive = bobYdoc.getMap('test').get('contents')?.toJSON()
  return bobReceive
}

export const demoMulticast = async (params) => {
  const {
    relay,
    roomId,
    simpleMessage,
    senderPrivateNostrKey,
    encrypt,
    decrypt
  } = params
  const senderSigner = new NDKPrivateKeySigner(senderPrivateNostrKey)
  const senderPubkey = (await senderSigner.user()).pubkey
  const senderYdoc = new yjs.Doc()
  const senderOpts = {}
  senderOpts.signer = senderSigner
  senderOpts.activeUser = senderSigner.user()
  senderOpts.explicitRelayUrls = [relay]
  const senderNdk = new NDK(senderOpts)
  await senderNdk.connect()
  const nostrProviderPlayer1 = new NostrProvider(
    senderYdoc,
    roomId,
    senderNdk,
    senderPubkey,
    YJS_UPDATE_EVENT_KIND,
    encrypt
  )
  nostrProviderPlayer1.initialize()

  const player2PrivateNostrKey = magicTestKeys[1].nostrPrivate
  const player2Signer = new NDKPrivateKeySigner(player2PrivateNostrKey)
  const player2Pubkey = (await player2Signer.user()).pubkey
  const player2Ydoc = new yjs.Doc()
  const player2Opts = {}
  player2Opts.signer = player2Signer
  player2Opts.activeUser = player2Signer.user()
  player2Opts.explicitRelayUrls = [relay]
  const player2Ndk = new NDK(player2Opts)
  await player2Ndk.connect()
  const nostrProviderPlayer2 = new NostrProvider(
    player2Ydoc,
    roomId,
    player2Ndk,
    player2Pubkey,
    YJS_UPDATE_EVENT_KIND,
    encrypt,
    decrypt
  )
  nostrProviderPlayer2.initialize()

  senderYdoc.getMap('test').set('contents', new yjs.Text(simpleMessage))
  await new Promise((resolve) => setTimeout(() => resolve(), 1000))
  const player2Received = player2Ydoc.getMap('test').get('contents')?.toJSON()
  return player2Received
}
