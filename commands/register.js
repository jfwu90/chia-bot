'use strict'

const db = require('../lib/db')

module.exports = {
  match (op, args) {
    return (op === 'reg' || op === 'register') && args.length > 0
  },

  async run ({ channel, author }, args) {
    await db.updateUser(author.id, { addr: args[0] })
    return channel.send(`Registered \`${args[0]}\` for ${author.toString()}`)
  }
}
