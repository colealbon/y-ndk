import * as yjs from 'yjs'
import {
  NDKPrivateKeySigner,
  createNostrCRDTRoom,
  NostrProvider,
  NDK
} from './y-ndk.mjs'
const YJS_UPDATE_EVENT_KIND = 9001
const yNostrRoomForm = document.querySelector('#y-ndk-room')
const demoRoundTripYjsNostrYjs = async () => {
  const roomOpts = {}
  const roomYdoc = new yjs.Doc()
  roomOpts.explicitRelayUrls = Object.values(yNostrRoomForm['nostr-relays'].options)
    .filter(option => option.selected)
    .map(option => option.value)
  const roomPrivateKey = yNostrRoomForm['private-nostr-key'].value
  const skSigner = await new NDKPrivateKeySigner(roomPrivateKey)
  roomOpts.signer = skSigner
  roomOpts.activeUser = roomOpts.signer.user()
  const roomNdk = new NDK(roomOpts)
  await roomNdk.connect()
  const initialLocalStateRoom = yjs.encodeStateAsUpdate(roomYdoc)
  const nostrRoomId = await createNostrCRDTRoom(
    roomNdk,
    'testWebApp',
    initialLocalStateRoom,
    YJS_UPDATE_EVENT_KIND
  )
  const nostrProviderRoom = new NostrProvider(
    roomYdoc,
    nostrRoomId,
    roomNdk,
    'roomLabel',
    YJS_UPDATE_EVENT_KIND
  )
  nostrProviderRoom.initialize()
  const guestOpts = {}
  const guestYdoc = new yjs.Doc()
  guestOpts.explicitRelayUrls = Object.values(yNostrRoomForm['nostr-relays'].options)
    .filter(option => option.selected)
    .map(option => option.value)
  const guestPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
  // const guestPrivateKey = yNostrRoomForm['private-nostr-key'].value
  const guestSigner = await new NDKPrivateKeySigner(guestPrivateKey)
  guestOpts.signer = guestSigner
  guestOpts.activeUser = guestOpts.signer.user()
  const guestNdk = new NDK(guestOpts)
  await guestNdk.connect()
  const nostrProviderGuest = new NostrProvider(
    guestYdoc,
    nostrRoomId,
    guestNdk,
    'roomLabel',
    YJS_UPDATE_EVENT_KIND
  )
  nostrProviderGuest.initialize()

  roomYdoc.getMap('test').set('contents', new yjs.Text('success yjs -> nostr -> yjs'))
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const roundTripResult = guestYdoc.getMap('test').get('contents')?.toJSON()
  console.log(roundTripResult)
}
yNostrRoomForm.addEventListener('submit', async event => {
  demoRoundTripYjsNostrYjs()
})
