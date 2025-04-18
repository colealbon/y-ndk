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

import {
  YJS_UPDATE_EVENT_KIND
} from './magic.mjs'
import chloride from 'chloride'
import box from 'private-box'

global.WebSocket = WebSocket

const TEST_NOSTR_RELAYS = ['ws://0.0.0.0:4444']

export const testEncryptDecrypt = async tc => {
  const keypair = chloride.crypto_box_keypair
  const alice = await keypair()
  const bob = await keypair()

  const encryptToReceivers = input => {
    const encoder = new TextEncoder()
    const encryptedInput = box.encrypt(encoder.encode(input), [alice, bob].map(key => key.publicKey))
    return encryptedInput
  }
  const decryptForBob = input => {
    const theBuffer = box.decrypt(input, bob.secretKey)
    console.log(theBuffer)
    const decoder = new TextDecoder()
    const decoded = decoder.decode(theBuffer)
    return decoded
  }
  const plaintext = 'hello charlie'
  const cyphertext = encryptToReceivers(plaintext)
  const decryptedbob = decryptForBob(cyphertext)
  await testing.compare(decryptedbob, plaintext, 'objects are equal')
}

export const testSyncMap = async tc => {
  const keypair = chloride.crypto_box_keypair
  const alice = await keypair()
  const bob = await keypair()
  const eve = await keypair()

  const encryptToReceivers = input => {
    const encoder = new TextEncoder()
    const encryptedInput = box.encrypt(encoder.encode(input), [alice, bob].map(key => key.publicKey))
    return encryptedInput
  }
  const decryptForBob = input => {
    const theBuffer = box.decrypt(input, bob.secretKey)
    console.log(theBuffer)
    const decoder = new TextDecoder()
    const decoded = decoder.decode(theBuffer)
    return decoded
  }

  const decryptForEve = input => {
    const theBuffer = box.decrypt(input, eve.secretKey)
    console.log(theBuffer)
    const decoder = new TextDecoder()
    const decoded = decoder.decode(theBuffer)
    return decoded
  }

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
  const decryptForAlice = input => {
    console.log('decryptForAlice')
    const theBuffer = box.decrypt(input, alice.secretKey)
    console.log(theBuffer)
    const decoder = new TextDecoder()
    const decoded = decoder.decode(theBuffer)
    return decoded
  }

  const initialLocalStateAlice = yjs.encodeStateAsUpdate(new yjs.Doc())

  const nostrRoomId = await createNostrCRDTRoom(
    aliceNdk,
    'testSyncYjsMap',
    initialLocalStateAlice,
    YJS_UPDATE_EVENT_KIND,
    alicePrivateKey,
    TEST_NOSTR_RELAYS,
    encryptToReceivers
  )

  const nostrProviderAlice = new NostrProvider(
    yjs,
    aliceYdoc,
    nostrRoomId,
    aliceNdk,
    alicePubkey,
    YJS_UPDATE_EVENT_KIND,
    encryptToReceivers,
    decryptForAlice
  )
  nostrProviderAlice.initialize()
  const bobPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
  const bobSigner = new NDKPrivateKeySigner(bobPrivateKey)
  const bobPubkey = (await bobSigner.user()).pubkey
  const bobOpts = {}
  bobOpts.signer = bobSigner
  bobOpts.activeUser = bobSigner.user()
  bobOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
  const bobNdk = new NDK(bobOpts)
  await bobNdk.connect()
  const bobYdoc = new yjs.Doc()
  const nostrProviderBob = new NostrProvider(
    yjs,
    bobYdoc,
    nostrRoomId,
    bobNdk,
    bobPubkey,
    YJS_UPDATE_EVENT_KIND,
    bobPrivateKey,
    TEST_NOSTR_RELAYS,
    encryptToReceivers,
    decryptForBob
  )
  nostrProviderBob.initialize()

  const evePrivateKey = 'c1b16fd71ace0636ca795b53c09fba2d3ac0a79684ebaea6325a1b57aa4f2644'
  const eveSigner = new NDKPrivateKeySigner(evePrivateKey)
  const evePubkey = (await eveSigner.user()).pubkey
  console.log('**************************************')
  console.log(evePubkey)
  const eveOpts = {}
  eveOpts.signer = eveSigner
  eveOpts.activeUser = eveSigner.user()
  eveOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
  const eveNdk = new NDK(eveOpts)
  await eveNdk.connect()
  const eveYdoc = new yjs.Doc()
  const nostrProviderEve = new NostrProvider(
    yjs,
    eveYdoc,
    nostrRoomId,
    eveNdk,
    evePubkey,
    YJS_UPDATE_EVENT_KIND,
    evePrivateKey,
    TEST_NOSTR_RELAYS,
    encryptToReceivers,
    decryptForEve
  )
  nostrProviderEve.initialize()

  await aliceYdoc.getMap('test').set('contents', new yjs.Text('hello'))
  await new Promise((resolve) => setTimeout(resolve, 1000))
//   const bobReceive = bobYdoc.getMap('test').get('contents')?.toJSON()
//   await testing.compare(bobReceive, 'hello', 'objects are equal')
//   const eveReceive = eveYdoc.getMap('test').get('contents')?.toJSON()
//   await testing.compare(eveReceive, 'hello', 'objects not equal')
}
