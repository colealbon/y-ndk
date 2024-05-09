import * as testing from 'lib0/testing'
import { WebSocket } from 'ws'
import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  NostrProvider,
  createNostrCRDTRoom
} from '../src/index.mjs'

global.WebSocket = WebSocket
const TEST_NOSTR_RELAYS = ['ws://0.0.0.0:8080']

export const testAlwaysPass = async tc => {
  testing.compare(true, true, 'objects are equal')
}
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
  const ydoc = new yjs.Doc()
  const initialLocalState = yjs.encodeStateAsUpdate(ydoc)
  const nostrCRDTCreateEventId = await createNostrCRDTRoom(
    ndk,
    'TestCRDTLabel',
    initialLocalState
  )
  const roomPubkey = await new Promise((resolve) => {
    const sub = ndk.subscribe({
      id: nostrCRDTCreateEventId
    }, {
      closeOnEose: false
    })
    sub.on('event', (event) => {
      resolve(event.pubkey)
    })
  })
  testing.compare(roomPubkey, PUBLIC_TEST_KEY, 'objects are equal')
}
export const testNostrProviderInitialize = async tc => {
  const ndkOpts = {}
  const PRIVATE_TEST_KEY = 'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
  const skSigner = new NDKPrivateKeySigner(PRIVATE_TEST_KEY)
  ndkOpts.explicitRelayUrls = TEST_NOSTR_RELAYS

  ndkOpts.signer = skSigner
  ndkOpts.activeUser = skSigner.user()
  const ndk = new NDK(ndkOpts)
  await ndk.connect()
  const ydoc = new yjs.Doc()
  const initialLocalState = yjs.encodeStateAsUpdate(ydoc)
  const nostrRoomId = await createNostrCRDTRoom(
    ndk,
    'testCRDTLabel',
    initialLocalState
  )
  const nostrProvider = new NostrProvider(
    ydoc,
    nostrRoomId,
    ndk
  )
  const result = await nostrProvider.initialize()
  testing.compare(result, 'success', 'objects are equal')
}
export const testSyncWithPublicRoomGuest = async tc => {
  const aliceOpts = {}
  const aliceYdoc = new yjs.Doc()
  aliceOpts.explicitRelayUrls = TEST_NOSTR_RELAYS

  const alicePrivateKey = 'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
  const aliceSigner = new NDKPrivateKeySigner(alicePrivateKey)
  aliceOpts.signer = aliceSigner
  aliceOpts.activeUser = aliceSigner.user()
  const aliceNdk = new NDK(aliceOpts)
  await aliceNdk.connect()
  const initialLocalStateAlice = yjs.encodeStateAsUpdate(new yjs.Doc())
  const nostrRoomId = await createNostrCRDTRoom(
    aliceNdk,
    'testSyncWithPublicRoomGuest',
    initialLocalStateAlice
  )

  const nostrProviderAlice = new NostrProvider(
    aliceYdoc,
    nostrRoomId,
    aliceNdk
  )
  const aliceInit = await nostrProviderAlice.initialize()
  testing.compare(aliceInit, 'success', 'objects are equal')
  console.log('alice initialized')

  const bobPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
  const bobSigner = new NDKPrivateKeySigner(bobPrivateKey)
  const bobOpts = {}
  bobOpts.signer = bobSigner
  bobOpts.activeUser = bobSigner.user()
  const bobNdk = new NDK(bobOpts)
  await bobNdk.connect()
  console.log('bobNdkConnected')
  const bobYdoc = new yjs.Doc()
  const nostrProviderBob = new NostrProvider(
    bobYdoc,
    nostrRoomId,
    bobNdk
  )
  console.log('bobNostrProvider')
  nostrProviderBob.initialize()
  // console.log('bob initialized')
  // testing.compare(bobInit, 'success', 'objects are equal')

  console.log('about to write hello')
  aliceYdoc.getMap('test').set('contents', new yjs.Text('hello'))
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const bobReceive = bobYdoc.getMap('test').get('contents')
  console.log('bobReceive')
  console.log(bobReceive)
  // .toJSON()
  // bobReceive.observe(event => 'bobEventObserved')
  testing.compare(bobReceive, 'hello', 'objects are equal')

  // Vanity npub found:         cafe - test bob
  // Found matching public key: c7539e3a6eac690d13f15d27557197187d6ffad50ad4236d42b823e9337eafdc
  // Nostr private key:         8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca
  // Nostr public key (npub):   npub1cafeuwnw435s6yl3t5n42uvhrp7kl7k4pt2zxm2zhq37jvm74lwqwtsflk
  // Nostr private key (nsec):  nsec130x7u8usv2dkvtrrgl94spn94zz03xl6y03chv6jh8g6yvcpcr9qpwv3u4

  // const bobOpts = {}
  // bobOpts.ydoc = new yjs.Doc()
  // bobOpts.ndk = new NDK(bobOpts)
  // bobOpts.ndk.explicitRelayUrls = TEST_NOSTR_RELAYS

  // bobOpts.ndk.signer = new NDKPrivateKeySigner(bytesToHex(generateSecretKey()))
  // bobOpts.ndk.activeUser = bobOpts.ndk.signer.user()

  // const skSigner = new NDKPrivateKeySigner(PRIVATE_TEST_KEY)
  // ndkOpts.explicitRelayUrls = TEST_NOSTR_RELAYS

  // ndkOpts.signer = skSigner
  // ndkOpts.activeUser = skSigner.user()
  // const ndk = new NDK(ndkOpts)
  // await ndk.connect()
  // await alice.client.connect()
  // const roomId = await createNostrCRDTRoom(
  //   alice.doc,
  //   alice.client,
  //   alice.privateKey,
  //   APP_NAMESPACE
  // );
  // const bob = {
  //   privateKey: generatePrivateKey(),
  //   doc: new Y.Doc(),
  //   relays,
  //   client: relayInit(relays[0]),
  // };
  // await bob.client.connect();
  // return {
  //   roomId,
  //   alice: {
  //     ...alice,
  //     provider: new NostrProvider(
  //       alice.doc,
  //       alice.client,
  //       alice.privateKey,
  //       roomId,
  //       APP_NAMESPACE
  //     ),
  //   },
  //   bob: {
  //     ...bob,
  //     provider: new NostrProvider(
  //       bob.doc,
  //       bob.client,
  //       bob.privateKey,
  //       roomId,
  //       APP_NAMESPACE
  //     )
  //   }
  // }
  // testing.compare('success', 'success', 'objects are equal')
}
