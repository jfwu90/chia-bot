'use strict'

require('dotenv').config() // Loads local .env file if it exists

const db = require('./lib/db')
const { Client } = require('discord.js')
const utility = require('./lib/utility')

const client = new Client()

client.once('ready', () => {
  console.log(`[${client.user.tag}]: Logged in`)
})

const handleMsg = require('./commands')(client)

async function checkChia() {
  const userIds = await db.getUserIds()

  for (let i = 0; i < userIds.length; ++i) {
    const userWallet = await db.getUserWallet(userIds[i])
    const xch = await utility.getChia(userWallet.addr)

    if (xch !== 0 && xch !== userWallet.xch) {
      const channel = await client.channels.fetch(process.env.NOTIFY_CHANNEL_ID)
      const user = await client.users.fetch(userIds[i])

      console.log('user.author = ', user.author)
      channel.send(`${utility.formatDiscordId(userIds[i])} has ${xch} Chia now!`)

      // update DB to store user's last chia to prevent repeat messages
      userWallet.xch = xch
      await db.updateUser(userIds[i], userWallet)
    }

    await utility.sleep(5000)
  }
}

/**
 * Entrypoint for the script.
 */
async function start() {
  try {
    await client.login(process.env.DISCORD_TOKEN_CHIA)
    client.on('message', handleMsg)
    setInterval(checkChia, 120 * 1000)
  } catch (err) {
    if (err.code === 'TOKEN_INVALID') {
      console.error('Failed to login to discord.')
    }

    console.error(err)
    process.exit(1)
  }
}

start()
