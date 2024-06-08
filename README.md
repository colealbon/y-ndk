# Y-NDK

update to the venerable [nostr-crdt](https://github.com/YousefED/nostr-crdt) package

- private crdt collaboration
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

## reference

nostr-crdt: [https://github.com/YousefED/nostr-crdt](https://github.com/YousefED/nostr-crdt)  
yjs: [https://github.com/yjs/yjs](https://github.com/yjs/yjs)  
ndk: [https://github.com/nostr-dev-kit/ndk](https://github.com/nostr-dev-kit/ndk)  
ndk-cli: [https://github.com/nostr-dev-kit/ndk-cli](https://github.com/nostr-dev-kit/ndk-cli)  
y-webrtc: [https://github.com/yjs/y-webrtc](https://github.com/yjs/y-webrtc)  
ssb-box: [https://github.com/ssbc/ssb-box](https://github.com/ssbc/ssb-box)  
private-box: [https://github.com/auditdrivencrypto/private-box](https://github.com/auditdrivencrypto/private-box)  
