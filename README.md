# Y-Nostr

CRDT based collaboration via nostr events

## installation

```sh
pnpm install;  
pnpm test;  
```

## client code

```js
import * as Y from 'yjs'
import { NostrProvider } from 'y-nostr'

const ydoc = new Y.Doc()
const nostrRoomId = await createNostrCRDTRoom(relays, privateKey, roomName, initialLocalState)
// const nostrRoomId = await fetchOrCreateNostrRoom({
// privateKey: yNostrRoomForm['private-nostr-key'].value,
// relays: selectedRelays
// }) 

// clients connected to the same room-name share document updates
const provider = new NostrProvider('your-room-name', ydoc, { password: 'optional-room-password' })
const yarray = ydoc.get('array', Y.Array)
```

## reference

yjs: [https://github.com/yjs/yjs](https://github.com/yjs/yjs)  
ndk: [https://github.com/nostr-dev-kit/ndk](https://github.com/nostr-dev-kit/ndk)  
ndk-cli: [https://github.com/nostr-dev-kit/ndk-cli](https://github.com/nostr-dev-kit/ndk-cli)  
nostr-crdt: [https://github.com/YousefED/nostr-crdt](https://github.com/YousefED/nostr-crdt)  
y-webrtc: [https://github.com/yjs/y-webrtc](https://github.com/yjs/y-webrtc)

## ethos (with change history)

~~if you don't start in the morning, you can't drink all day~~  
~~they hate us for our freedoms~~  
we build tools to support direct digital commerce
