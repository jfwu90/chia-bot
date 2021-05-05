'use strict'

const Keyv = require('keyv')
const path = require('path')

const table = 'chia_keys'
const keyv = new Keyv(`sqlite://${path.join(__dirname, '..', 'db.sqlite')}`, { table })

keyv.on('error', err => console.log('Connection Error', err));

module.exports = {
  keyv,

  updateUser (userId, opts) {
    return keyv.set(userId, { addr: opts.addr, xch: opts.xch || 0 })
  },

  deleteUser (userId) {
    return keyv.delete(userId)
  },

  getUserWallet (userId) {
    return keyv.get(userId)
  },

  async getUserIds () {
    return (await keyv.opts.store.query(`SELECT key FROM ${table};`))
      .map(entry => entry.key.split('keyv:')[1])
  }
}
