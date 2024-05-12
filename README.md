# Y-NDK

changes to the venerable nostr-crdt package  

- use ndk instead of nostr-tools
- use observableV2 to leverage patterns from y-webrtc and y-websocket communities
- drop boomer typescript support
- replace webpack/jest syntax with rollup.js and lib0/test

## install (npm install y-ndk isn't set up yet)

```sh
git clone https://github.com/colealbon/y-ndk.git;  
cd y-ndk;  
pnpm install;  
pnpm test;  
pnpm build; 
```

## development

```sh
brew install entr
ls src/* test/* | entr pnpm test 
```

## client code (from the test folder)

```js
import { WebSocket } from 'ws'
import * as yjs from 'yjs'
import NDK, {
  NDKPrivateKeySigner
} from '@nostr-dev-kit/ndk'
import {
  NostrProvider,
  createNostrCRDTRoom
} from '../src/index.mjs'
import { getPublicKey } from 'nostr-tools'

global.WebSocket = WebSocket
const TEST_NOSTR_RELAYS = ['ws://localhost:8080']
const YJS_UPDATE_EVENT_KIND = 9001

const aliceOpts = {}
const aliceYdoc = new yjs.Doc()
aliceOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
const alicePrivateKey = 'd334d0ddf781a958b410f6f079c0cccde0f6d76badcb043bf522ec2bc77c961b'
const alicePubkey = getPublicKey(alicePrivateKey)
const aliceSigner = new NDKPrivateKeySigner(alicePrivateKey)
aliceOpts.signer = aliceSigner
aliceOpts.activeUser = aliceSigner.user()
const aliceNdk = new NDK(aliceOpts)
await aliceNdk.connect()
const initialLocalStateAlice = yjs.encodeStateAsUpdate(new yjs.Doc())
const nostrRoomId = await createNostrCRDTRoom(
    aliceNdk,
    'testSyncYjsMap',
    initialLocalStateAlice,
    YJS_UPDATE_EVENT_KIND
)

const nostrProviderAlice = new NostrProvider(
    aliceYdoc,
    nostrRoomId,
    aliceNdk,
    alicePubkey,
    YJS_UPDATE_EVENT_KIND
)
nostrProviderAlice.initialize()
const bobPrivateKey = '8bcdee1f90629b662c6347cb580665a884f89bfa23e38bb352b9d1a23301c0ca'
const bobPubkey = getPublicKey(bobPrivateKey)
const bobSigner = new NDKPrivateKeySigner(bobPrivateKey)
const bobOpts = {}
bobOpts.signer = bobSigner
bobOpts.activeUser = bobSigner.user()
bobOpts.explicitRelayUrls = TEST_NOSTR_RELAYS
const bobNdk = new NDK(bobOpts)
await bobNdk.connect()
const bobYdoc = new yjs.Doc()
const nostrProviderBob = new NostrProvider(
    bobYdoc,
    nostrRoomId,
    bobNdk,
    bobPubkey,
    YJS_UPDATE_EVENT_KIND
)
nostrProviderBob.initialize()
aliceYdoc.getMap('test').set('contents', new yjs.Text('hello'))
await new Promise((resolve) => setTimeout(resolve, 2000))
nostrRelay.close()
const bobReceive = bobYdoc.getMap('test').get('contents')?.toJSON()
// testing.compare(bobReceive, 'hello', 'objects are equal')
```

## reference

yjs: [https://github.com/yjs/yjs](https://github.com/yjs/yjs)  
ndk: [https://github.com/nostr-dev-kit/ndk](https://github.com/nostr-dev-kit/ndk)  
ndk-cli: [https://github.com/nostr-dev-kit/ndk-cli](https://github.com/nostr-dev-kit/ndk-cli)  
nostr-crdt: [https://github.com/YousefED/nostr-crdt](https://github.com/YousefED/nostr-crdt)  
y-webrtc: [https://github.com/yjs/y-webrtc](https://github.com/yjs/y-webrtc)

## ethos (with change history)

~~if you don't start in the morning, you can't drink all day~~  
it's time to win
