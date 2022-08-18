require('dotenv').config();
const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits } = require('discord.js')
var connected = true;

const discordBot = new Client({
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    },
    intents: [GatewayIntentBits.Guilds],
});

let minecraftBot;
botMaker();

function botMaker() {
    try {
        minecraftBot = mineflayer.createBot({
            host: 'minecraft.server', // server IP goes here, use localhost if connecting to LAN
            username: process.env.EMAIL,
            password: process.env.PASSWORD,
            // port: 12345, // uncomment this if connecting to LAN and put in the right port number
            auth: 'microsoft', // comment this out if you haven't migrated
        });
    } catch (error) {
        console.error(error);
        botMaker();
    }
}

// ID variables
const discordServerID = 'serverID'; // discord server ID here
const chatChannelID = 'channelID'; // discord channel ID here

// Console log bot logins and disconnects
discordBot.on('ready', () => {
    console.log(`The Discord bot ${discordBot.user.username} is ready!`);
});

// When mc bot is logged into the server
minecraftBot.on('login', () => {
    console.log('Minecraft bot has logged in!');
    toDiscordChat('***:green_circle: Went Online!***');
});

// When mc bot is logged out from the server
minecraftBot.on('end', () => {
    console.log('Minecraft bot disconnected from the server.');
    toDiscordChat('***:red_circle: Went Offline!***');
});

// Discord message handler
async function toDiscordChat(msg) {
    await discordBot.guilds.cache.get(discordServerID).channels.fetch();
    return discordBot.guilds.cache.get(discordServerID).channels.cache.get(chatChannelID).send({
        content: msg,
    });
}

// Sends mc messages to discord
minecraftBot.on('message', (message) => {
    var current = new Date();
    const time = '[' + current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds() + ']'
    if (message.toString().includes("joined the game") || message.toString().includes("left the game")) {
        toDiscordChat('**' + time + ' ' + message.toString() + '**');
    } else if (message.toString().includes("has made the advancement") || message.toString().includes("has completed the challenge")) {
        toDiscordChat('**' + time + ' :trophy: ' + message.toString() + '**');
    } else {
        toDiscordChat(time + ' ' + message.toString());
    }
});

// Discord commands, and discord messages to game chat
discordBot.on('messageCreate', async (message) => {
    try {
        if (message.author.id === discordBot.user.id || message.channel.id !== chatChannelID || message.author.bot) return; // join command
        if (connected === false && message.toString() === '?join') {
            connected = !connected;
            console.log(connected);
            console.log("This is pid " + process.pid);
            setTimeout(function() {
                process.on("exit", function() {
                    require("child_process").spawn(process.argv.shift(), process.argv, {
                        cwd: process.cwd(),
                        detached: true,
                        stdio: "inherit"
                    });
                });
                process.exit();
            });
        } else if (message.toString() === '?leave' && connected !== false) { // leave command
            minecraftBot.quit();
            connected = !connected;
            console.log(connected);
        } else if (message.toString() === '?playerlist' && connected !== false) { // playerlist command
            const playerList = Object.keys(minecraftBot.players).join(", ");
            toDiscordChat('**Current Online Players: ```' + playerList + '```**');
        } else { // messages to game chat
            minecraftBot.chat(message.content);
            await message.delete();
        }
    } catch (error) {
        console.error(error);
    }
});

discordBot.login(process.env.BOT_TOKEN);
