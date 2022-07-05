require('dotenv').config(); //initialize dotenv
const Discord = require('discord.js'); //import discord.js
const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');
const database = mongoose.connection
const mongoString = process.env.DATABASE_URL;
const express = require('express');
const app = express();
const handleJobs = require("./remoteokjob-scraper");
const Model = require('./model');
const schedule = require('node-schedule');
const port = 9000;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
let jobs = [];
const rule = new schedule.RecurrenceRule();


rule.hour = 9;

const handleDailyJob = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!');
  handleJobs.getAllJobs()
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message', async msg => {
    if (msg.content === 'Divine, send us job updates.') {
        try{
            const getJobs = await Model.find();
            jobs = getJobs;
        }
        catch(error){
            console.log({message: error.message})
        }
      for (let i = 0; i < 2; i++) {
        console.log('new job ',jobs[i]);
        setTimeout(() => {
            msg.reply(
                `@everyone\nJob update \nTitle: ${jobs[i].title} \n Organization Name: ${jobs[i].organizationName} \n technologies: ${jobs[i].technologies.toString()} `
                );
        }, 1000)
    }
    }
});

client.on('message', async msg => {
  switch (msg.content) {
   //other commands above here...
   case "!eye":
    //   msg.channel.send(jobs.toString());
    //    interval = setInterval (function () {
    //     msg.channel.send(jobs)
    //     .catch(console.error); 
    //   }, 1000); //every hour
    // jobs.map(job => {
    //     interval = setTimeout (function() {
    //         msg.channel.send(JSON.stringify(job));
    //     }, 2000)
    // })
    for (let i = 0; i < 2; i++) {
        console.log('new job ',jobs[i]);
        setTimeout(() => {
            msg.channel.send(JSON.stringify(jobs[i]))
        }, 5 * 1000)
    }
    break;
  }
})

interval = setTimeout (function() {
    handleJobs.getAllJobs()
}, 12 * 3600 * 1000)
handleJobs.getAllJobs()

app.get('/', (req, res) => {
    res.send("Hi, I'm Divine, I'm running fine!");
});

mongoose.connect(mongoString);
database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
client.login(process.env.CLIENT_TOKEN); //login bot using token