'use strict'

const axios = require('axios')

module.exports = {
  /**
   * Formats a discordId so it shows up as a tag in discord messages
   */
  formatDiscordId (discordId) {
    return `<@${discordId}>`
  },

  /**
   * Extracts the discord id from within discord's formatting for tags
   */
  extractDiscordId (idTag) {
    return idTag.replace(/[<@!>]/g, '')
  },

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  async getChia (receiveAddress) {
    try {
      const url = `https://api2.chiaexplorer.com/balance/${receiveAddress}`
      const response = await axios.get(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
        }
      })
      return response.data.grossBalance / (Math.pow(10, 12))
    } catch (error) {
      return 0
    }
  }
}
