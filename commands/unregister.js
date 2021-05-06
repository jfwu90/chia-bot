'use strict'

const db = require('../lib/db')

module.exports = {
  name: 'unregister',
  match (op) {
    return op === 'unreg' || op === 'unregister'
  },

  async run ({ channel, author }) {
    await db.deleteUser(author.id)
    return channel.send(`Unregistered ${author.toString()}`)
  }
}
