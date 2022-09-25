// Bot
const dotenv = require('dotenv');
dotenv.config();

const { Client, Intents } = require('discord.js');
const discord_client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.token
const GUILD_ID = process.env.guild_id
const CLIENT_ID = process.env.client_id
const FEEDER_ROLE_ID = process.env.feeder_role

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

var feedCount = 0;
var feedersArray = [];
var currentFeedersCount = 0;

const commands = [{
  name: 'feed',
  description: 'Tube feed him now!'
},{
  name: 'send_meal',
  description: 'Send him a meal.'
}];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

discord_client.on('ready', () => {
  console.log(`Logged in as ${discord_client.user.tag}!`);
  discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: Is online and ready  - Use '/feed' to start feeding this fatty.`)
});

discord_client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  feederUser = interaction.member.user.username

  if (interaction.member.roles.cache.has(FEEDER_ROLE_ID)) {

    feedersArray.push(feederUser);
    currentFeedersCount = feedersArray.filter(obj => obj == feederUser).length

    if (currentFeedersCount > 5) {

      await interaction.reply('Sorry but you have hit your current limit of feedings. This will reset for the next feeding.');

    } else {

      if (interaction.commandName === 'feed') {
        feedCount++
        console.log(`Current count: #${feedCount}`);
        await interaction.reply(`${feederUser}: Your feeding has been added to the queue. #${feedCount}`);
      }
    
      if (interaction.commandName === 'send_meal') {
        await interaction.reply('Follow this link https://treatstream.com/t/treat/madwhim to see meal options.');
      }

    }
  } else {

    await interaction.reply('You dont have a feeder role, sorry!');

  }

})
;

discord_client.login(token);

// API
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('');
});

app.get('/api/count', (req, res) => {
  res.send({feed_count: feedCount});
});

app.listen(3000, () => console.log('server started'));
