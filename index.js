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

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

var feedCount = 0;

const commands = [{
  name: 'feed',
  description: 'Feed him!'
},{
  name: 'send_meal',
  description: 'Send a meal'
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
  // console.log(`Count started on  ${GUILD_ID} :  ${CLIENT_ID}`);
});


discord_client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'feed') {
    feedCount++
    console.log(`Current count: #${feedCount}`);
    await interaction.reply(`Your feeding has been added to the queue. #${feedCount}`);
  }

  if (interaction.commandName === 'send_meal') {
    await interaction.reply('Follow this link https://treatstream.com/t/treat/madwhim to see meal options and send it.');
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
