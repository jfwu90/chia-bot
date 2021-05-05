'use strict'

const db = require('../lib/db')
const utility = require('../lib/utility')

module.exports = {
  default: true,

  match (op) {
    return op === 'wallet'
  },

  async run ({ channel, author }, args) {
    const userWallet = await db.getUserWallet(author.id)

    const addr = args.length
      ? args[0]
      : userWallet.addr

    if (!addr) {
      return channel.send(`Receive address not registered for ${author.toString()}. Please register with \`$chia reg <receive_address>\`.`)
    }

    const xch = await utility.getChia(addr) // xch is the ticker for chia coin

    if (userWallet && userWallet.addr === addr) {
      await db.updateUser(author.id, { addr, xch })
      return channel.send(`You have ${xch} Chia.${!xch ? ' LOL' : ''}`)
    }

    return channel.send(`Address \`${addr}\` has ${xch} Chia.`)
  }
}
