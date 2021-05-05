'use strict'

const db = require('../lib/db')

module.exports = {
  match (op, args) {
    return op === 'users'
  },

  async run ({ channel, guild }) {
    const userIds = await db.getUserIds()
    const output = {}

    for (let i = 0; i < userIds.length; ++i) {
      const user = (await guild.members.fetch(userIds[i])).user
      output[`${user.username}#${user.discriminator}`] = (await db.getUserWallet(user.id)).addr
    }

    if (Object.keys(output).length === 0) {
      return channel.send('No users stored')
    }

    return channel.send([
      '```',
      JSON.stringify(output, null, '\t'),
      '```',
    ].join())
  }
}
