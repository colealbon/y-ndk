import { ObservableV2 } from 'lib0/observable'
import {
  toBase64,
  fromBase64
} from 'lib0/buffer'
import {
  NDKEvent
} from '@nostr-dev-kit/ndk'
import {
  arrayBuffersAreEqual,
  snapshotContainsAllDeletes
} from './util.mjs'
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'

const pool = new SimplePool()

export async function createNostrCRDTRoom (
  ndk,
  label,
  initialLocalState,
  YJS_UPDATE_EVENT_KIND,
  secretNostrKey,
  explicitRelayUrls,
  encrypt = (passthrough) => passthrough
) {
  // plagiarized from:
  // https://github.com/YousefED/nostr-crdt/blob/main/packages/nostr-crdt/src/createNostrCRDTRoom.ts

  return new Promise((resolve) => {
    const sub = ndk.subscribe({
      since: Math.floor(Date.now() / 1000) - 1,
      kinds: [YJS_UPDATE_EVENT_KIND]
    }, {
      closeOnEose: false
    })
    sub.on('event', (event) => {
      resolve(event.id)
    })

    if (secretNostrKey === undefined) {
      const event = new NDKEvent(ndk, {
        kind: YJS_UPDATE_EVENT_KIND,
        tags: [[crdt, label]],
        content: toBase64(encrypt(initialLocalState))
      })
      ndk.publish(event)
    }

    if (secretNostrKey !== undefined) {
      ndk.signer.user().then(theUser => {
        const signedEvent = finalizeEvent({
          kind: YJS_UPDATE_EVENT_KIND,
          created_at: Math.floor(Date.now() / 1000),
          tags: [[crdt, label]],
          content: toBase64(encrypt(initialLocalState)),
          publicKey: theUser.pubkey
        }, secretNostrKey)
        verifyEvent(signedEvent) && pool.publish(explicitRelayUrls, signedEvent)
      })
    }
  })
}

export const hello = () => console.log('hello from y-ndk.js')

export class NostrProvider extends ObservableV2 {
  constructor (
    yjs,
    ydoc,
    nostrRoomCreateEventId,
    ndk,
    publicKey,
    YJS_UPDATE_EVENT_KIND,
    encrypt = (passthrough) => passthrough,
    decrypt = (passthrough) => passthrough
  ) {
    super()
    this.yjs = yjs
    this.ydoc = ydoc
    this.ndk = ndk
    this.nostrRoomCreateEventId = nostrRoomCreateEventId
    this.ydoc.on('update', this.documentUpdateListener)
    this.publicKey = publicKey
    this.YJS_UPDATE_EVENT_KIND = YJS_UPDATE_EVENT_KIND
    this.encrypt = encrypt
    this.decrypt = decrypt
  }

  updateFromEvents (events) {
    let updates = null
    updates = events.map((e) => {
      return this.decrypt(fromBase64(e.content))
    })
    const update = this.yjs.mergeUpdates(updates)
    return update
  }

  publishUpdate (update) {
    const ndkEvent = new NDKEvent(this.ndk)
    ndkEvent.kind = this.YJS_UPDATE_EVENT_KIND
    ndkEvent.created_at = Math.floor(Date.now() / 1000)
    ndkEvent.content = toBase64(this.encrypt(update))
    ndkEvent.tags = [
      ['e', this.nostrRoomCreateEventId]
    ]
    ndkEvent.sig = ''
    this.ndk.publish(ndkEvent).catch(error => {
      console.log(error)
    })
  }

  pendingUpdates = []
  sendPendingTimeout

  async documentUpdateListener (update, origin) {
    // https://discuss.yjs.dev/t/how-to-distinguish-which-user-triggered-this-update/2584
    if (origin === this) {
      return
    }
    if (origin?.provider) {
      return
    }
    this?.pendingUpdates.push(update)

    if (this?.sendPendingTimeout) {
      clearTimeout(this.sendPendingTimeout)
    }

    // buffer every 100ms
    if (this === undefined) {
      return
    }
    this.sendPendingTimeout = setTimeout(() => {
      this.publishUpdate(this.yjs.mergeUpdates(this.pendingUpdates))
      this.pendingUpdates = []
    }, 100)
  }

  /**
  * Handles incoming events from nostr
  */
  processIncomingEvents = (events) => {
    const update = this.updateFromEvents(events)
    this.yjs.applyUpdate(this.ydoc, update, this)
  }

  async initialize () {
    try {
      let eoseSeen = false
      const initialEvents = []
      const sub = this.ndk.subscribe([
        {
          ids: [this.nostrRoomCreateEventId],
          kinds: [this.YJS_UPDATE_EVENT_KIND],
          limit: 1,
          since: 0
        },
        {
          '#e': [this.nostrRoomCreateEventId],
          kinds: [this.YJS_UPDATE_EVENT_KIND]
        }
      ])
      sub.on('event', (e) => {
        if (!eoseSeen) {
          initialEvents.push(e)
        } else {
          this.processIncomingEvents([e])
        }
      })
      sub.on('eose', () => {
        eoseSeen = true
        const initialLocalState = this.yjs.encodeStateAsUpdate(this.ydoc)
        const initialLocalStateVector = this.yjs.encodeStateVectorFromUpdate(initialLocalState)
        const deleteSetOnlyUpdate = this.yjs.diffUpdate(
          initialLocalState,
          initialLocalStateVector
        )
        const oldSnapshot = this.yjs.snapshot(this.ydoc)
        // This can fail because of no access to room. Because the room history should always be available,
        // we don't catch this event here
        const update = this.updateFromEvents(initialEvents)
        if (initialEvents.length > 0) {
          this.yjs.applyUpdate(this.ydoc, update, this)
        }

        // this.emit('documentAvailable') <-- this breaks stuff, don't know why, y-nkd seems to work without
        // Next, find if there are local changes that haven't been synced to the server
        const remoteStateVector = this.yjs.encodeStateVectorFromUpdate(update)
        const missingOnWire = this.yjs.diffUpdate(
          initialLocalState,
          remoteStateVector
        )
        // missingOnWire will always contain the entire deleteSet on startup.
        // Unfortunately diffUpdate doesn't work well with deletes. In the if-statement
        // below, we try to detect when missingOnWire only contains the deleteSet, with
        // deletes that already exist on the wire
        if (
          arrayBuffersAreEqual(
            deleteSetOnlyUpdate.buffer,
            missingOnWire.buffer
          )
        ) {
          // TODO: instead of next 3 lines, we can probably get deleteSet directly from 'update'
          const serverDoc = new this.yjs.Doc()
          this.yjs.applyUpdate(serverDoc, update)
          const serverSnapshot = this.yjs.snapshot(serverDoc)
          // TODO: could also compare whether snapshot equal? instead of snapshotContainsAllDeletes?
          if (snapshotContainsAllDeletes(serverSnapshot, oldSnapshot)) {
            // missingOnWire only contains a deleteSet with items that are already in the deleteSet on server
          }
        }
        if (missingOnWire.length > 2) {
          this.publishUpdate(missingOnWire)
        }
      })
    } catch (e) {
      console.error(e)
    }
  }
}
