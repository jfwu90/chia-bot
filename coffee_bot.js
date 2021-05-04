'use strict';

require('dotenv').config() // Loads local .env file if it exists

const axios = require('axios');
const moment = require('moment');
const { Client } = require('discord.js');
const cheerio = require('cheerio');
const _ = require('lodash');

const URL = 'https://www.baratza.com/shop/refurb';

const users = [
  '248592148708982784', // Chris
  // '126559113210626048' // Farhan
]

const client = new Client()

client.once('ready', () => {
  console.log(`[${client.user.tag}]: Logged in`)
})

function broadcast (message) {
  return Promise.all(users.map(async userId => {
    const user = await client.users.fetch(userId)
    await user.send(message);
  }))
}

const throttledBroadcast = _.throttle(broadcast, 1000 * 60 * 20);

async function checkProducts () {
  console.log(`Requesting at ${moment().format('LTS')}`);

  try {
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);
    const products = $('.product-item .product-item-link').map((i, element) => {
      return {
        name: $(element).text().trim(),
        link: $(element).attr('href'),
      };
    }).toArray();

    products.forEach(({ name, link }) => {
      if (/sette 270/i.test(name)) {
        throttledBroadcast(`${name} is available for purchase at ${link}`);
      }
    });
  } catch (error) {
    console.warn(error);
  }
}

/**
 * Entrypoint for the script.
 */
async function start() {
  try {
    await client.login(process.env.DISCORD_TOKEN_COFFEE)
    checkProducts();
    setInterval(checkProducts, 60 * 1000);
  } catch (err) {
    if (err.code === 'TOKEN_INVALID') {
      console.error('Failed to login to discord.')
    }

    console.error(err)
    process.exit(1)
  }
}

start()
