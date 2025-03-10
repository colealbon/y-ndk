// plagiarized from:
// https://github.com/YousefED/nostr-crdt/blob/main/packages/nostr-crdt/src/InMemoryRelayServer.ts

import { WebSocketServer } from 'ws'
// import { matchFilters } from 'nostr-tools'
export class NostrRelay {
  events = []
  wss
  subs = new Map()
  connections = new Set()
  constructor (port = 8888, host = 'localhost') {
    console.log('*******************************')
    this.wss = new WebSocketServer({ port, host })
    this.wss.on('connection', (ws) => {
      this.connections.add(ws)
      // console.log('connected')
      ws.on('message', (message) => {
        const data = JSON.parse(message.toString())
        // console.log('received: %s', JSON.stringify(data))
        if (data && data[0] === 'REQ') {
          const sub = data[1]
          const filters = data.slice(2)
          this.subs.set(sub, { filters, ws })
          for (const event of this.events) {
            // if (matchFilters(filters, event)) {
            // console.log('sending event to sub %s', sub, JSON.stringify(['EVENT', sub, event]))
            ws.send(JSON.stringify(['EVENT', sub, event]))
            // }
          }
          // console.log('sending eose to sub %s', sub, JSON.stringify(['EOSE', sub]))
          ws.send(JSON.stringify(['EOSE', sub]))
        } else if (data && data[0] === 'EVENT') {
          const event = data[1]
          this.events.push(event)
          for (const [sub, data] of this.subs) {
            // if (matchFilters(data.filters, event)) {
            // console.log(
            //   'sending event to sub %s',
            //   sub,
            //   JSON.stringify(['EVENT', sub, event])
            // )
            data.ws.send(JSON.stringify(['EVENT', sub, event]))
            // }
          }
        } else if (data && data[0] === 'CLOSE') {
          const sub = data[1]
          this.subs.delete(sub)
        }
      })
    })
  }

  async close () {
    await new Promise((resolve) => this.wss.close(resolve))
  }

  clear () {
    this.events = []
    this.subs = new Map()
  }

  disconnectAll () {
    for (const ws of this.connections) {
      ws.close()
    }
  }
}
