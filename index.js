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
var fed = 0;
var fluid_lvl = 15; // US cups in a gallon
var current_weight = 350;

var feedersArray = [];
var currentFeedersCount = 0;

const commands = [
{
  name: 'feed',
  description: 'Tube feed him now!'
}
// ,{
//   name: 'send_meal',
//   description: 'Send him a meal.'
// }
];

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
  // discord_client.channels.cache.get("1023727568144314378").send(`@Feeder - FeedBot: Is online and ready - Use '/feed' to start feeding this fatty.`)
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
        console.log(`Queued Feedings: #${feedCount} Fed: ${fed}`);
        await interaction.reply(`#${feedCount}: ${feederUser} - Thanks for helping expand this fatty, your feeding has been added to the queue. ${currentFeedersCount} out of 5 feedings left for this session. This fatty has been fed ${fed} times so far!`);
      }

      // if (interaction.commandName === 'send_meal') {
      //   await interaction.reply('Follow this link https://treatstream.com/t/treat/madwhim to see meal options.');
      // }

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

app.get('/fed',function(req,res) {
  res.sendFile('obs_fed.html');
});

// Push updates for session from machine EXAMPLE: /session/update?fed=25&fluid_lvl=11
app.get('/session/update', (req, res) => {
  fed = parseInt(req.query.fed);
  fluid_lvl = parseInt(req.query.fluid_lvl);
  res.send('');
});

// Push updates for session from machine
app.get('/session', (req, res) => {
  res.send({
    feed_count: feedCount,
    fed_count: fed,
    fluid_lvl: fluid_lvl,
    current_weight: current_weight
  });
});

app.listen(3000, () => console.log('server started'));
