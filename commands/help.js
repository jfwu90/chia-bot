'use strict'

module.exports = {
  match (op) {
    return op === 'h' || op === 'help'
  },

  async run ({ channel }) {
    const helpMsg = `
\`\`\`
${process.env.PREFIX} register <receive_address> - Registers receive address to user
${process.env.PREFIX} unregister - Deletes your information
${process.env.PREFIX} users - Lists all stored users
${process.env.PREFIX} wallet - Checks your receive address for chia
${process.env.PREFIX} wallet <receive_address> - Checks receive address for chia
\`\`\`
`.trim()

    return channel.send(helpMsg)
  }
}
