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
  // discord_client.channels.cache.get("1023727568144314378").send(`@Feeder - FeedBot: I am online and ready to feed - Use '/feed' to feed him. Just so you know, I have turned off all limited feedings... ;)`)
});

discord_client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  feederUser = interaction.member.user.username

  if (interaction.member.roles.cache.has(FEEDER_ROLE_ID)) {

    feedersArray.push(feederUser);
    currentFeedersCount = feedersArray.filter(obj => obj == feederUser).length

    feedCount++
    console.log(`Queued Feedings: #${feedCount} Fed: ${fed}`);

    if (fed === 52) {
      discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: He has been fed ${fed} times. Thats the full gallon! You all did a great job today! Thank you so much for the help! What else should we do in the future to balloon this fat ass? Please leave comments here. :)`);
    } else if (fed === 35) {
      discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: He has downed ${fed} feedings so far. He looks to be nearing the half gallon mark.`);
    } else if (fed === 25) {
      discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: He downed ${fed} feedings. I bet he can feel his stomach really starting to stretch out now.`);
    } else if (fed === 15) {
      discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: ${fed} feedings down. Much better, more!`);
    } else if (fed === 8) {
      discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: ${fed} feedings. We can do better than that... right?`);
    } else {
      // discord_client.channels.cache.get("1023727568144314378").send(`FeedBot: ${fed} feedings so far.`);
    }

    if (interaction.commandName === 'feed') {
      if (currentFeedersCount > 20) {
          await interaction.reply(`FeedBot: ${feederUser} you have fed this fatty ${currentFeedersCount} times out of ${fed} feedings. You are actually starting to stretch out his fat belly! ;)`);
      } else if (currentFeedersCount > 15) {
          await interaction.reply(`FeedBot: ${feederUser} you have fed this fatty ${currentFeedersCount} times out of ${fed} feedings. Looks like his stomach is really starting to feel the impact of your feedings.`);
      } else if (currentFeedersCount > 5) {
          await interaction.reply(`FeedBot: ${feederUser} you have fed him ${currentFeedersCount} times out of ${fed} feedings. Is that all you got?`);
      } else {
          await interaction.reply(`FeedBot: ${feederUser} - Thanks for helping expand this fatty, your feeding has been added to the queue. You have fed this fat ass ${currentFeedersCount} times so far.`);
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
