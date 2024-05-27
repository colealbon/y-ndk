import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  // NostrProvider,
  createNostrCRDTRoom
} from './y-ndk.mjs'

import {
  YJS_UPDATE_EVENT_KIND,
  NOSTR_RELAY,
  PRIVATE_NOSTR_ROOM_KEY
} from './magic.mjs'

export const defaultNostrRoomPayload = () => ({
  'nostr-event-kind': YJS_UPDATE_EVENT_KIND.toString(),
  'nostr-relay': NOSTR_RELAY.toString(),
  'private-nostr-room-key': PRIVATE_NOSTR_ROOM_KEY.toString()
})

export const demoCreateNostrRoom = async (params) => {
  const {
    // nostrEventKind,
    relay,
    privateNostrRoomKey
  } = params
  return new Promise((resolve, reject) => {
    const roomOpts = {}
    roomOpts.signer = new NDKPrivateKeySigner(privateNostrRoomKey)
    roomOpts.explicitRelayUrls = [relay]
    roomOpts.activeUser = roomOpts.signer.user()
    const roomNdk = new NDK(roomOpts)
    roomNdk.connect()
      .then(() => {
        const roomYdoc = new yjs.Doc()
        const initialLocalStateRoom = yjs.encodeStateAsUpdate(roomYdoc)
        createNostrCRDTRoom(
          roomNdk,
          'testWebApp',
          initialLocalStateRoom,
          YJS_UPDATE_EVENT_KIND
        ).then(roomId => resolve(roomId))
      })
  })
//   const nostrProviderRoom = new NostrProvider(
//     roomYdoc,
//     nostrRoomId,
//     roomNdk,
//     'roomLabel',
//     YJS_UPDATE_EVENT_KIND
//   )
//   nostrProviderRoom.initialize()
//   const guestOpts = {}
//   const guestYdoc = new yjs.Doc()
//   guestOpts.explicitRelayUrls = Object.values(yNostrRoomForm['nostr-relays'].options)
//     .filter(option => option.selected)
//     .map(option => option.value)
//   const guestPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
//   // const guestPrivateKey = yNostrRoomForm['private-nostr-key'].value
//   const guestSigner = await new NDKPrivateKeySigner(guestPrivateKey)
//   guestOpts.signer = guestSigner
//   guestOpts.activeUser = guestOpts.signer.user()
//   const guestNdk = new NDK(guestOpts)
//   await guestNdk.connect()
//   const nostrProviderGuest = new NostrProvider(
//     guestYdoc,
//     nostrRoomId,
//     guestNdk,
//     'roomLabel',
//     YJS_UPDATE_EVENT_KIND
//   )
//   nostrProviderGuest.initialize()
//   roomYdoc.getMap('test').set('contents', new yjs.Text('success yjs -> nostr -> yjs'))
//   await new Promise((resolve) => setTimeout(resolve, 2000))
//   const roundTripResult = guestYdoc.getMap('test').get('contents')?.toJSON()
//   console.log(roundTripResult)
}
