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
const path = require('path');

var feedCount = 0;
var fed = 0;
var fluid_lvl = 15; // US cups in a gallon
var current_weight = 350;

var feedersArray = [];
var currentFeedersCount = 0;

const commands = [
{
  name: 'feed',
  description: 'Tube feed him!'
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
  discord_client.channels.cache.get("1023727568144314378").send(`@Feeder - FeedBot: I am online and ready to feed - Use '/feed' to feed him. Just so you know, I have turned off all limited feedings... just do not let him know. ;)`)
});

discord_client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  feederUser = interaction.member.user.username

  if (interaction.member.roles.cache.has(FEEDER_ROLE_ID)) {

    feedersArray.push(feederUser);
    currentFeedersCount = feedersArray.filter(obj => obj == feederUser).length

    if (fed > 52) {
      await interaction.reply(`FeedBot: He has been fed ${fed} times. Thats the full gallon! You all did a great job today! Thank you so much for the help! What else should we do in the future to balloon this fat ass? Any suggestions? Please leave comments here and we will change thing up. :)`);
    } else if (fed > 35) {
      await interaction.reply(`FeedBot: He has put down ${fed} feedings, just a little bit more! I bet he can feel his stomach really starting stretch out now.`);
    } else if (fed > 25) {
      await interaction.reply(`FeedBot: He has taken ${fed} feedings so far, looks to be nearing the half way mark on a full gallon.`);
    } else if (fed > 15) {
      await interaction.reply(`FeedBot: ${fed} feedings down. Much better. Dont stop now!`);
    } else if (fed > 8) {
      await interaction.reply(`FeedBot: ${fed} feedings down. Thats good start, but lets really balloon him!`);
    } else {
      await interaction.reply(`FeedBot: ${fed} feedings down.`);
    }

    if (currentFeedersCount > 20) {
      if (interaction.commandName === 'feed') {
        await interaction.reply(`FeedBot: ${feederUser} you have fed this fatty ${currentFeedersCount} times out of ${fed} feedings. You are really wanting to watch his belly grow... I like it! ;)`);
      }
    } else if (currentFeedersCount > 15) {
      if (interaction.commandName === 'feed') {
        await interaction.reply(`FeedBot: ${feederUser} you have fed this fatty ${currentFeedersCount} times out of ${fed} feedings. I bet his stomach is really starting to feel the impact of your feedings.`);
      }
    } else if (currentFeedersCount > 5) {
      if (interaction.commandName === 'feed') {
        await interaction.reply(`FeedBot: ${feederUser} you have fed him ${currentFeedersCount} times out of ${fed} feedings. Now thats what I like to see, keep it up!`);
      }
    } else {
      if (interaction.commandName === 'feed') {
        await interaction.reply(`FeedBot: ${feederUser} - Thanks for helping expand this fatty, your feeding has been added to the queue. You've fed this fat ass ${currentFeedersCount} times so far.`);
      }

      // if (interaction.commandName === 'send_meal') {
      //   await interaction.reply('Follow this link https://treatstream.com/t/treat/madwhim to see meal options.');
      // }
    }

    feedCount++
    console.log(`Queued Feedings: #${feedCount} Fed: ${fed}`);
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

app.get('/feed', function(req, res) {
  res.sendFile(path.join(__dirname, '/obs_feed.html'));
});

app.get('/fed', function(req, res) {
  res.sendFile(path.join(__dirname, '/obs_fed.html'));
});

app.get('/ffluid', function(req, res) {
  res.sendFile(path.join(__dirname, '/obs_fluid.html'));
});

app.get('/weight', function(req, res) {
  res.sendFile(path.join(__dirname, '/obs_weight.html'));
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
