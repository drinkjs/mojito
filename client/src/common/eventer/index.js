const Events = require('events')

export class GlobalEventer extends Events.EventEmitter {
  remove (eventName) {
    this.removeAllListeners(eventName)
  }
}

const event = new GlobalEventer()
event.setMaxListeners(1024)

export default event
