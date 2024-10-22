require('dotenv').config();
const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits } = require('discord.js');

let connected = false;
let autoReconnect = true;
let minecraftBot;

// Discord bot initialization
const discordBot = new Client({
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Bot creation with auto-reconnection handling
function botMaker() {
    try {
        minecraftBot = mineflayer.createBot({
            host: 'minecraft.server', // Server IP (use localhost for LAN)
            username: process.env.EMAIL,
            password: process.env.PASSWORD,
            auth: 'microsoft', // Comment this out if you haven’t migrated
        });

        minecraftBot.on('login', onMinecraftLogin);
        minecraftBot.on('end', onMinecraftEnd);
        minecraftBot.on('message', onMinecraftMessage);
    } catch (error) {
        console.error('Error in bot creation:', error);
        setTimeout(botMaker, 5000); // Retry connection after 5 seconds
    }
}

botMaker(); // Initialize Minecraft bot

// Discord bot login
discordBot.login(process.env.BOT_TOKEN);

// ID variables
const discordServerID = 'serverID'; // Discord server ID here
const chatChannelID = 'channelID';  // Discord channel ID here

// Discord bot events
discordBot.on('ready', () => {
    console.log(`Discord bot ${discordBot.user.username} is ready!`);
});

discordBot.on('messageCreate', handleDiscordMessage);

// Minecraft bot events
function onMinecraftLogin() {
    console.log('Minecraft bot has logged in!');
    toDiscordChat('***:green_circle: Went Online!***');
    connected = true;
}

function onMinecraftEnd() {
    console.log('Minecraft bot disconnected.');
    connected = false;

    if (autoReconnect && !connected) {
        console.log('Attempting to reconnect...');
        setTimeout(() => {
            process.on("exit", () => {
                require("child_process").spawn(process.argv.shift(), process.argv, {
                    cwd: process.cwd(),
                    detached: true,
                    stdio: "inherit"
                });
            });
            process.exit();
        }, 5000); // Delay before reconnecting
    }
}

function onMinecraftMessage(message) {
    const current = new Date();
    const time = `[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]`;
    
    if (message.toString().includes("joined the game") || message.toString().includes("left the game")) {
        toDiscordChat(`**${time} ${message.toString()}**`);
    } else if (message.toString().includes("has made the advancement") || message.toString().includes("has completed the challenge")) {
        toDiscordChat(`**${time} :trophy: ${message.toString()}**`);
    } else {
        toDiscordChat(`${time} ${message.toString()}`);
    }
}

// Sends messages to a Discord channel
async function toDiscordChat(msg) {
    try {
        const guild = discordBot.guilds.cache.get(discordServerID);
        const channel = guild.channels.cache.get(chatChannelID);
        await channel.send({ content: msg });
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
}

// Discord message handler
async function handleDiscordMessage(message) {
    try {
        if (message.author.id === discordBot.user.id || message.channel.id !== chatChannelID || message.author.bot) return;

        if (!connected && message.content === '?join') {
            reconnectMinecraftBot();
        } else if (connected && message.content === '?reconnect') {
            toDiscordChat('***:arrows_counterclockwise: Reconnecting!***');
            minecraftBot.quit();
        } else if (connected && message.content === '?leave') {
            toDiscordChat('***:red_circle: Went Offline!***');
            autoReconnect = false;
            minecraftBot.quit();
        } else if (connected && message.content === '?playerlist') {
            const playerList = Object.keys(minecraftBot.players).join(", ");
            toDiscordChat(`**Current Online Players: \`\`\`${playerList || "No players online"}\`\`\`**`);
        } else {
            minecraftBot.chat(message.content);
            await message.delete(); // Remove the message from Discord after sending to Minecraft
        }
    } catch (error) {
        console.error('Error handling Discord message:', error);
    }
}

// Reconnects the Minecraft bot
function reconnectMinecraftBot() {
    console.log('Reconnecting Minecraft bot...');
    process.on("exit", () => {
        require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached: true,
            stdio: "inherit"
        });
    });
    process.exit();
}
