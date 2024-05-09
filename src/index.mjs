import { ObservableV2 } from 'lib0/observable'
import {
  toBase64,
  fromBase64
} from 'lib0/buffer'
import * as yjs from 'yjs'
import {
  NOSTR_CRDT_EVENT_TYPE
} from './magic.mjs'
import {
  NDKEvent
} from '@nostr-dev-kit/ndk'
import {
  arrayBuffersAreEqual,
  snapshotContainsAllDeletes
} from './util.mjs'

export async function createNostrCRDTRoom (
  ndk,
  label,
  initialLocalState
) {
  return new Promise((resolve) => {
    const sub = ndk.subscribe({
      since: Math.floor(Date.now() / 1000) - 1,
      kinds: [NOSTR_CRDT_EVENT_TYPE]
    }, {
      closeOnEose: false
    })
    sub.on('event', (event) => {
      resolve(event.id)
    })
    const ndkEvent = new NDKEvent(ndk)
    ndkEvent.created_at = Math.floor(Date.now() / 1000)
    ndkEvent.kind = NOSTR_CRDT_EVENT_TYPE
    ndkEvent.content = toBase64(initialLocalState)
    ndkEvent.tags = [['crdt', label]]
    ndk.publish(ndkEvent)
  })
}
export class NostrProvider extends ObservableV2 {
  async documentUpdateListener (update, origin) {
    console.log('documentUpdateListener')
    if (origin === this) {
      console.log('these are updates that came in from NostrProvider')
      return
    }
    if (origin?.provider) {
      console.log('origin')
      console.log(origin)
      // update from peer (e.g.: webrtc / websockets). Peer is responsible for sending to Nostr
      return
    }
    this.pendingUpdates.push(update)

    if (this.sendPendingTimeout) {
      clearTimeout(this.sendPendingTimeout)
    }

    // buffer every 100ms
    this.sendPendingTimeout = setTimeout(() => {
      console.log('pendingUpdates')
      this.publishUpdate(yjs.mergeUpdates(this.pendingUpdates))
      this.pendingUpdates = []
    }, 100)
  }

  constructor (
    ydoc,
    nostrRoomCreateEventId,
    ndk
  ) {
    super()
    this.ydoc = ydoc
    this.ndk = ndk
    this.nostrRoomCreateEventId = nostrRoomCreateEventId
    this.ydoc.on('update', (theupdate, origin) => this.documentUpdateListener(theupdate, origin))
  }

  updateFromEvents (events) {
    // Create a yjs update from the events
    const updates = events.map((e) => new Uint8Array(fromBase64(e.content)))
    const update = yjs.mergeUpdates(updates)
    return update
  }

  publishUpdate (update) {
    const ndkEvent = new NDKEvent(this.ndk)
    ndkEvent.kind = NOSTR_CRDT_EVENT_TYPE
    ndkEvent.created_at = Math.floor(Date.now() / 1000)
    ndkEvent.content = toBase64(update)
    ndkEvent.tags = [
      ['e', this.nostrRoomCreateEventId]
    ]
    this.ndk.publish(ndkEvent)
  }

  pendingUpdates = []

  sendPendingTimeout

  /**
  * Handles incoming events from nostr
  */
  processIncomingEvents = (events) => {
    console.log('processIncomingEvents')
    events.forEach((e) => {
      console.log('received', e.id, 'from', e.pubkey, '(i am)', this.ndk._activeUser._pubkey)
    })

    const update = this.updateFromEvents(events)

    const docBefore = this.ydoc.toJSON()
    yjs.applyUpdate(this.ydoc, update, this)
    const docAfter = this.ydoc.toJSON()
    console.log(docBefore, 'after', docAfter)
  }

  async initialize () {
    console.log('initialize')
    return new Promise((resolve, reject) => {
      try {
        let eoseSeen = false
        const initialEvents = []
        const sub = this.ndk.subscribe([
          {
            ids: [this.nostrRoomCreateEventId],
            kinds: [NOSTR_CRDT_EVENT_TYPE]
            //,
            // limit: 1,
            // since: 0
          },
          {
            '#e': [this.nostrRoomCreateEventId],
            kinds: [NOSTR_CRDT_EVENT_TYPE]
          }
        ])
        console.log('subscribed')
        // console.log(sub)
        sub.on('event', (e) => {
          console.log('event')
          if (!eoseSeen) {
            initialEvents.push(e)
          } else {
            this.processIncomingEvents([e])
          }
        })
        sub.on('close', (e) => {
          console.log('close')
          console.log(e)
        })
        sub.on('eose', () => {
          console.log('eose')
          eoseSeen = true
          const initialLocalState = yjs.encodeStateAsUpdate(this.ydoc)
          const initialLocalStateVector = yjs.encodeStateVectorFromUpdate(initialLocalState)
          const deleteSetOnlyUpdate = yjs.diffUpdate(
            initialLocalState,
            initialLocalStateVector
          )
          const oldSnapshot = yjs.snapshot(this.ydoc)
          // This can fail because of no access to room. Because the room history should always be available,
          // we don't catch this event here
          const update = this.updateFromEvents(initialEvents)
          yjs.applyUpdate(this.ydoc, update, this)
          console.log('updateapplied')
          this.emit('documentAvailable')
          // Next, find if there are local changes that haven't been synced to the server
          const remoteStateVector = yjs.encodeStateVectorFromUpdate(update)
          const missingOnWire = yjs.diffUpdate(
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
            const serverDoc = new yjs.Doc()
            yjs.applyUpdate(serverDoc, update)
            const serverSnapshot = yjs.snapshot(serverDoc)
            // TODO: could also compare whether snapshot equal? instead of snapshotContainsAllDeletes?
            if (snapshotContainsAllDeletes(serverSnapshot, oldSnapshot)) {
              // missingOnWire only contains a deleteSet with items that are already in the deleteSet on server
              resolve('success')
            }
          }
          if (missingOnWire.length > 2) {
            this.publishUpdate(missingOnWire)
          }
          resolve('success')
        })
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  }
}
