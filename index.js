'use strict';

require('dotenv').config() // Loads local .env file if it exists

const axios = require('axios');
const moment = require('moment');
const { Client } = require('discord.js');
const cheerio = require('cheerio');
const _ = require('lodash');
const fs = require('fs').promises;

const URL = 'https://www.baratza.com/shop/refurb';
const CHANNEL_ID = '835331272598487071';

const client = new Client()

client.once('ready', () => {
  console.log(`[${client.user.tag}]: Logged in`)
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function broadcast (message) {
  return Promise.all(users.map(async userId => {
    const user = await client.users.fetch(userId)
    await user.send(message);
  }))
}

const throttledBroadcast = _.throttle(broadcast, 1000 * 60 * 20);

async function getDb() {
  try {
    const data = await fs.readFile('chia.json');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function checkChia() {
  const db = await getDb();

  const users = Object.values(db);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const { receiveAddress } = user;
    const chia = await getChia(receiveAddress);
    if (chia !== 0 && chia !== user.chia) {
      const channel = client.channels.cache.get(CHANNEL_ID);
      console.log('user.author = ', user.author);
      client.channels.cache.get(CHANNEL_ID).send(`<@${user.author.id}> has ${chia} Chia now!`);

      // update DB to store user's last chia to prevent repeat messages
      db[user.author.id].chia = chia;
      await fs.writeFile('chia.json', JSON.stringify(db));
    }
    await sleep(5000);
  }
}

async function updateUser(author, receiveAddress) {
  const db = await getDb();
  db[author.id] = {
    author,
    receiveAddress,
  }
  await fs.writeFile('chia.json', JSON.stringify(db));
}

function getDisplayName(author) {
  return `${author.username}#${author.discriminator}`;
}

async function getChia(receiveAddress) {
  try {
    const url = `https://api2.chiaexplorer.com/balance/${receiveAddress}`;
    const response = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
      }
    });
    return response.data.grossBalance / (Math.pow(10, 12));
  } catch (error) {
    return 0;
  }
}

const COMMANDS = `
\`\`\`
$register <receive_address> - Registers receive address to user
$unregister - Deletes your information
$users - Lists all stored users
$chia - Checks your receive address for chia
$chia <receive_address> - Checks receive address for chia
\`\`\`
`.trim();

async function onMessage(message) {
  const addRegex = /^\$register (\S+)$/;
  const chiaRegex = /^\$chia (\S+)$/;
  try {
    const { author, content } = message;
    if (addRegex.test(content)) {
      const receiveAddress = content.match(addRegex)[1];
      await updateUser(message.author, receiveAddress);
      message.channel.send(`Registered \`${receiveAddress}\` to ${author.toString()}`);
    } else if (content === '$users') {
      const db = await getDb();
      const list = {};
      Object.values(db).forEach((value) => {
        list[`${value.username}#${value.discriminator}`] = value.receiveAddress;
      });
      message.channel.send([
        '```',
        JSON.stringify(list, null, '\t'),
        '```',
      ].join());
    } else if (content === '$help') {
      message.channel.send(COMMANDS);
    } else if (content === '$chia') {
      const db = await getDb();
      const receiveAddress = (db[message.author.id] || {}).receiveAddress;
      if (!receiveAddress) {
        message.channel.send(`Receive address not registered for ${author.toString()}. Please register with \`$register <receive_address>\`.`)
      } else {
        const chia = await getChia(receiveAddress);
        const messageToSend = [`You have ${chia} Chia.`];
        if (chia === 0) {
          messageToSend.push('LOL');
        }
        message.channel.send(messageToSend.join(' '));
      }
    } else if (chiaRegex.test(content)) {
      const receiveAddress = content.match(chiaRegex)[1];
      const chia = await getChia(receiveAddress);
      message.channel.send(`Address \`${receiveAddress}\` has ${chia} Chia.`);
    } else if (content === '$unregister') {
      const db = await getDb();
      delete db[message.author.id];
      message.channel.send(`Unregistered ${author.toString()}.`);
      await fs.writeFile('chia.json', JSON.stringify(db));
    }
  } catch (error) {
    message.channel.send(error);
  }
}

/**
 * Entrypoint for the script.
 */
async function start() {
  try {
    await client.login(process.env.DISCORD_TOKEN_CHIA)
    client.on('message', onMessage);
    checkChia();
    setInterval(checkChia, 120 * 1000);
  } catch (err) {
    if (err.code === 'TOKEN_INVALID') {
      console.error('Failed to login to discord.')
    }

    console.error(err)
    process.exit(1)
  }
}

start()
