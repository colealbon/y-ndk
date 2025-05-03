# Y-NDK

update to the venerable [nostr-crdt](https://github.com/YousefED/nostr-crdt) package

- private crdt collaboration
- use ndk instead of nostr-tools
- use observableV2 to leverage patterns from y-webrtc and y-websocket communities
- drop boomer typescript support
- replace webpack/jest syntax with rollup.js and lib0/test

[11 minute web app demo](https://www.youtube.com/watch?v=d0k07-eXXE0)   
[12 minute solidjs demo](https://www.youtube.com/watch?v=Uai98RGlu-8)


## install
```sh
npm install @colealbon/y-ndk
```

## example usage

[node unit tests](https://github.com/colealbon/y-ndk/tree/main/test).  
[generic web app](https://github.com/colealbon/y-ndk/tree/main/demo).  
[solidjs app](https://gitlab.com/cole.albon/spike)


## develop

```sh
git clone https://github.com/colealbon/y-ndk.git;
cd y-ndk;
pnpm install;
pnpm run test-cleartext; sleep 2; pnpm run test-private
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

## the future
we anticipate a client will pass in modern encrypt/decrypt functions - like whatever solidifies from this discussion:  
MLS protocol: [https://github.com/nostr-protocol/nips/pull/1206#issuecomment-2180291416](https://github.com/nostr-protocol/nips/pull/1206#issuecomment-2180291416)
