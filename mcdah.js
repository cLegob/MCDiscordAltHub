const fs = require('fs'); // Ensure you have the fs module to read/write files
const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits } = require('discord.js');
const { exec } = require('child_process');

let options;
try {
    const data = fs.readFileSync(process.env.OPTIONS_FILE, 'utf8');
    options = JSON.parse(data);
} catch (err) {
    console.error(`Error reading or parsing ${process.env.OPTIONS_FILE}:`, err);
    process.exit(1);
}

let connected = false;
let autoReconnect = options.minecraft.auto_reconnect;
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
async function botMaker() {
    if (connected) return; // Prevent multiple connections
    try {
        minecraftBot = mineflayer.createBot({
            host: options.minecraft.server_host,
            port: options.minecraft.server_port,
            username: process.env.MINECRAFT_EMAIL,
            password: process.env.MINECRAFT_PASSWORD,
            auth: process.env.MINECRAFT_AUTH_TYPE,
        });

        minecraftBot.on('login', onMinecraftLogin);
        minecraftBot.on('end', onMinecraftEnd);
    } catch (error) {
        await toDiscordChat(`***:x: Error in bot creation:***\n\`\`\`${error}\`\`\``);
        setTimeout(botMaker, options.minecraft.reconnect_time_seconds * 1000); // Retry connection after 5 seconds
    }
}

// Initialize Minecraft bot
botMaker();

// Discord bot login
discordBot.login(process.env.DISCORD_BOT_TOKEN);
discordBot.on('messageCreate', async (message) => {
    await handleDiscordMessage(message);
});

// Minecraft bot events
async function onMinecraftLogin() {
    await toDiscordChat('***:green_circle: Went Online!***\nLogged in to: ' + options.minecraft.server_host);
    connected = true;
}

async function onMinecraftEnd() {
    await toDiscordChat('***:red_circle: Went Offline!***');
    connected = false;

    if (autoReconnect) {
        await toDiscordChat('***:arrows_counterclockwise: Attempting to reconnect...***');
        setTimeout(botMaker, options.minecraft.reconnect_time_seconds * 1000); // Retry connection after 5 seconds
    }
}

// Sends messages to a Discord channel
async function toDiscordChat(msg) {
    try {
        const guild = discordBot.guilds.cache.get(process.env.DISCORD_SERVER_ID);
        const channel = guild.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        await channel.send({ content: msg });
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
}

// Discord message handler
async function handleDiscordMessage(message) {
    try {
        if (message.author.id === discordBot.user.id || message.channel.id !== process.env.DISCORD_CHANNEL_ID || message.author.bot) return;

        // Handle commands that start with !
        if (message.content.startsWith('!')) {
            const command = message.content.slice(1).trim().split(' ')[0]; // Get command after '!'
            const args = message.content.slice(command.length + 2).trim(); // Get arguments after command

            switch (command) {
                case 'editoptions':
                    await handleEditOptions(args);
                    break;

                case 'options':
                    await handleOptions();
                    break;

                case 'join':
                    if (!connected) {
                        await reloadMinecraftBot();
                    } else {
                        await toDiscordChat('***:green_circle: Already connected to Minecraft!***');
                    }
                    break;

                case 'reload':
                    if (connected) {
                        minecraftBot.quit(); // Disconnect the bot
                        await reloadMinecraftBot(); // Triggers onMinecraftEnd to reconnect
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
                        await toDiscordChat(`**Current Online Players: \`\`\`${playerList || "No players online"}\`\`\`**`);
                    } else {
                        await toDiscordChat('***:red_circle: Not connected to Minecraft!***');
                    }
                    break;

                default:
                    await toDiscordChat(`***:x: Unknown command: ${command}***`);
                    break;
            }
        }

        // Handle messages that start with .
        if (message.content.startsWith('.')) {
            const minecraftMessage = message.content.slice(1).trim(); // Remove the .
            minecraftBot.chat(minecraftMessage);
            await message.delete(); // Remove the message from Discord after sending to Minecraft
            await toDiscordChat('[Sent From Discord] ' + minecraftMessage);
        }
    } catch (error) {
        await toDiscordChat(`***:x: Error handling Discord message:***\n\`\`\`${error}\`\`\``);
    }
}

// Handles the editoptions command
async function handleEditOptions(args) {
    const keyValuePair = args.trim();
    if (!keyValuePair) {
        await toDiscordChat('***:x: Please provide a key-value pair to edit, e.g., `!editoptions minecraft.server_host=<new_ip>`***');
        return;
    }

    const [keyPath, value] = keyValuePair.split('=').map(v => v.trim());
    if (!value) {
        await toDiscordChat('***:x: Invalid format. Use `!editoptions <section>.<key>=<value>`***');
        return;
    }

    // Execute the updateConfig.js script
    exec(`node updateOptions.js ${process.env.OPTIONS_FILE} ${keyPath} ${value}`, (error, stdout) => {
        if (error) {
            toDiscordChat(`***:x: Failed to update options.***\n\`\`\`${error}\`\`\``);
            return;
        }
        if (connected) {
            toDiscordChat(`***:white_check_mark: ${stdout.trim()}***\nUse \`!reload\` for the changes to take effect.`);
        } else {
            toDiscordChat(`***:white_check_mark: ${stdout.trim()}***\nChanges will take effect upon next login.`);
        }
    });
}

// Handles the options command
async function handleOptions() {
    fs.readFile(process.env.OPTIONS_FILE, 'utf8', async (err, data) => {
        if (err) {
            await toDiscordChat(`***:x: Failed to read ${process.env.OPTIONS_fILE} file.***\n\`\`\`${err}\`\`\``);
            return;
        }

        // Parse the JSON data
        let config;
        try {
            config = JSON.parse(data);
        } catch (jsonErr) {
            await toDiscordChat(`***:x: Failed to parse ${process.env.OPTIONS_FILE} file.***\n\`\`\`${jsonErr}\`\`\``);
            return;
        }

        // Send the config as a code block
        await toDiscordChat(`\`\`\`json\n${JSON.stringify(config, null, 4)}\n\`\`\``);
    });
}

// Reconnects the Minecraft bot
async function reloadMinecraftBot() {
    exec('pm2 restart mcdah.js --update-env', (error, stdout) => {
        if (error) {
            console.error(`Error restarting Minecraft bot: ${error}`);
            return;
        }
        console.log(`Minecraft bot restarted: ${stdout}`);
    });
}
