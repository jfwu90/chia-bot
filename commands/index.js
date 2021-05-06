'use strict'

const utility = require('../lib/utility')
const fs = require('fs')
const path = require('path')

const tagIds = new Set(process.env.TAG_IDS.split(',').filter(e => e))

// Load all commands at startup
const commands = fs.readdirSync(__dirname, { withFileTypes: true })
  .filter(file => /(?<!index)\.js$/.test(file.name) && !file.isDirectory())
  .map(file => require(path.join(__dirname, file.name)))

module.exports = (client) => {
  return async function handleMsg(msg) {
    const words = msg.content.match(/^(\S+)(?: (.+))?$/)
    const args = ((words && words[2]) || '').split(' ').filter(e => e)
    const op = args.shift() || '' // operation

    // If valid prefix, find matching command and execute
    if (words && (tagIds.has(utility.extractDiscordId(words[1])) || words[1] === process.env.PREFIX)) {
      let cmd
      let defaultCmd

      for (let i = 0; i < commands.length && !cmd; ++i) {
        if (commands[i].match(op, args)) {
          cmd = commands[i]
        }

        if (commands[i].default) {
          defaultCmd = commands[i]
        }
      }

      if (!cmd) {
        cmd = defaultCmd

        // If no command operation was specified and we're falling back to the default command, the op isn't an op
        if (op) {
          args.unshift(op)
        }
      }

      if (cmd) {
        try {
          await cmd.run(msg, args)
        } catch (err) {
          console.log(`Command [${op}] failed`, err)
        }
      }
    }
  }
}
