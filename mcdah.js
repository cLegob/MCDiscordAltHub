const fs = require('fs'); // Ensure you have the fs module to read/write files
const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config({ path: '.env' }); // Load sensitive credentials

let connected = false;
let autoReconnect = process.env.SETTINGS_AUTO_RECONNECT;
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

// Function to create the Minecraft bot
function botMaker() {
    if (connected) return; // Prevent multiple connections
    try {
        minecraftBot = mineflayer.createBot({
            host: process.env.MINECRAFT_SERVER_HOST,
            port: process.env.MINECRAFT_SERVER_PORT,
            username: process.env.MINECRAFT_EMAIL,
            password: process.env.MINECRAFT_PASSWORD,
            auth: process.env.MINECRAFT_AUTH_TYPE,
        });

        minecraftBot.on('login', onMinecraftLogin);
        minecraftBot.on('end', onMinecraftEnd);
        minecraftBot.on('kicked', onMinecraftEnd);
    } catch (error) {
        toDiscordChat('***:x: Error in bot creation:***\n\`\`\`', error, '\`\`\`');
        setTimeout(botMaker, 5000); // Retry connection after 5 seconds
    }
}

// Initialize Minecraft bot
botMaker();

// Discord bot login
discordBot.login(process.env.DISCORD_BOT_TOKEN); // Token from ecosystem.env

// Discord bot events
discordBot.on('messageCreate', handleDiscordMessage);

// Minecraft bot events
function onMinecraftLogin() {
    toDiscordChat('***:green_circle: Went Online!***\nLogged in to: ' + process.env.MINECRAFT_SERVER_HOST);
    connected = true;
}

function onMinecraftEnd() {
    toDiscordChat('***:red_circle: Went Offline!***');
    connected = false;

    if (autoReconnect) {
        toDiscordChat('***:arrows_counterclockwise: Attempting to reconnect...***');
        setTimeout(botMaker, 5000); // Retry connection after 5 seconds
    }
}

// Sends messages to a Discord channel
async function toDiscordChat(msg) {
    try {
        const guild = discordBot.guilds.cache.get(process.env.DISCORD_SERVER_ID);
        const channel = guild.channels.cache.get(process.env.DISCORD_COMMAND_CENTER_ID);
        await channel.send({ content: msg });
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
}

// Discord message handler
async function handleDiscordMessage(message) {
    try {
        if (message.author.id === discordBot.user.id || message.channel.id !== process.env.DISCORD_COMMAND_CENTER_ID || message.author.bot) return;

        // Handle commands that start with !
        if (message.content.startsWith('!')) {
            const command = message.content.slice(1).trim(); // Remove the ! and trim spaces

            // Check if command starts with "editconfig"
            if (command.startsWith('editconfig')) {
                const keyValuePair = command.split('editconfig ')[1]?.trim();
                if (!keyValuePair) {
                    await toDiscordChat('***:x: Please provide a key-value pair to edit, e.g., `!editconfig minecraft.server_host=<new_ip>`***');
                    return;
                }

                const [keyPath, value] = keyValuePair.split('=').map(v => v.trim());
                if (!value) {
                    await toDiscordChat('***:x: Invalid format. Use `!editconfig <section>.<key>=<value>`***');
                    return;
                }

                // Execute the updateConfig.js script
                exec(`node updateConfig.js ${keyPath} ${value}`, (error, stdout, stderr) => {
                    if (error) {
                        toDiscordChat('***:x: Failed to update configuration.***\n\`\`\`', error, '\`\`\`');
                        return;
                    }
                    toDiscordChat(`***:white_check_mark: ${stdout.trim()}***\nUse \`!reload\` for the changes to take effect.`);
                });
                return; // End the function if the command was processed
            }

            // Check for the config command
            if (command === 'config') {
                fs.readFile('ecosystem.json', 'utf8', (err, data) => {
                    if (err) {
                        toDiscordChat('***:x: Failed to read ecosystem.json file.***\n\`\`\`', err, '\`\`\`');
                        return;
                    }

                    // Parse the JSON data
                    let config;
                    try {
                        config = JSON.parse(data);
                    } catch (jsonErr) {
                        toDiscordChat('***:x: Failed to parse ecosystem.json file.***\n\`\`\`', jsonErr, '\`\`\`');
                        return;
                    }

                    // Mask sensitive information
                    config.discord.bot_token = '****';
                    config.minecraft.email = '****';
                    config.minecraft.password = '****';

                    // Send the config as a code block
                    toDiscordChat(`\`\`\`json\n${JSON.stringify(config, null, 4)}\n\`\`\``);
                });
                return; // End the function if the command was processed
            }

            // Other command handling logic...
            switch (command) {
                case 'join':
                    if (!connected) {
                        reloadMinecraftBot();
                    } else {
                        await toDiscordChat('***:green_circle: Already connected to Minecraft!***');
                    }
                    break;

                case 'reload':
                    if (connected) {
                        minecraftBot.quit(); // Disconnect the bot
                        reloadMinecraftBot(); // Triggers onMinecraftEnd to reconnect
                    } else {
                        await toDiscordChat('***:red_circle: Not connected to Minecraft!***');
                    }
                    break;

                case 'leave':
                    if (connected) {
                        autoReconnect = false; // Disable auto-reconnect
                        minecraftBot.quit(); // Triggers onMinecraftEnd
                    } else {
                        await toDiscordChat('***:red_circle: Not connected to Minecraft!***');
                    }
                    break;

                case 'playerlist':
                    if (connected) {
                        const playerList = Object.keys(minecraftBot.players).join(", ");
                        toDiscordChat(`**Current Online Players: \`\`\`${playerList || "No players online"}\`\`\`**`);
                    } else {
                        await toDiscordChat('***:red_circle: Not connected to Minecraft!***');
                    }
                    break;

                default:
                    await toDiscordChat(`***:x: Unknown command: ${command}***`);
                    break;
            }
            return; // End the function if a command was processed
        }

        // Handle messages that start with .
        if (message.content.startsWith('.')) {
            const minecraftMessage = message.content.slice(1); // Remove the .
            minecraftBot.chat(minecraftMessage);
            await message.delete(); // Remove the message from Discord after sending to Minecraft
            await toDiscordChat('[Sent From Discord] ' + minecraftMessage);
        }
    } catch (error) {
        await toDiscordChat('***:x:Error handling Discord message:***\n\`\`\`', error, '\`\`\`');
    }
}

// Reconnects the Minecraft bot
function reloadMinecraftBot() {
    exec('node updateConfig.js');
    exec('pm2 restart mcdah.js');
}
