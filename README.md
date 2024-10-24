# Minecraft-Discord Alt Hub

This project integrates a Minecraft bot with a Discord bot, allowing users to interact with their Minecraft accounts through Discord.

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)
- PM2 (for process management)

## Installation

1. **Clone the repository:**
   git clone https://github.com/cLegob/MCDiscordAltHub.git
   cd MCDiscordAltHub

2. **Install dependencies:**
   npm install mineflayer discord.js

3. **Set up config files:**
   See the next step to learn how to fill out your config files (`options.json` and `ecosystem.config.js`).

## Configuration Files

### 1. `options.json`

This JSON file contains configuration settings for both Minecraft and Discord. It can be edited while the bot is running using !editoptions, or viewed by just using !options.

```
{
    "minecraft": {
        "server_host": "server_ip", // Replace with your Minecraft server's IP address
        "server_port": 25565, // Default port for Minecraft servers
        "auto_reconnect": true, // Set to true if you want the bot to automatically reconnect to the server
        "reconnect_time_seconds": 5 // Time (in seconds) to wait before attempting to reconnect
    },
    "discord": {
        "coming_soon": "maybe :)" // Any additional Discord-related options
    }
}
```

### 2. `ecosystem.config.js`

This file is used for configuring PM2 to manage your bot. This file can not be edited while the bot is running, and it will contain sensitive information, such as your minecraft login, and discord bot token. Do not share it!
```module.exports = {
    apps: [{
        name: 'Minecraft-Discord Alt Hub',
        script: 'mcdah.js',
        env: {
            NODE_ENV: 'production',

            MINECRAFT_EMAIL: 'your_email@example.com', // Your Minecraft email
            MINECRAFT_PASSWORD: 'your_password', // Your Minecraft password
            MINECRAFT_AUTH_TYPE: 'microsoft', // Authentication type (e.g., 'microsoft' or 'mojang')

            DISCORD_BOT_TOKEN: 'your_discord_bot_token', // Your Discord bot token
            DISCORD_SERVER_ID: 'your_discord_server_id', // Your Discord server ID
            DISCORD_CHANNEL_ID: 'your_discord_channel_id' // Your Discord channel ID
        }
    }]
}
```
## Usage

1. **Start the application with PM2:**
   pm2 start ecosystem.config.js

2. **Monitor the application:**
   pm2 logs Minecraft-Discord Alt Hub

3. **Stop the application:**
   pm2 stop Minecraft-Discord Alt Hub

## Commands
### Discord Commands:
1. **`!join` and `!leave`**:
   make the bot join and leave the server respectively
2. **`!playerlist`**: view a list of players on the connected server
3. **`!reload`**: reloads the bot to update the bot after changing the options file (also useful for quickly reconnecting to a server)
4. **`!options`**: allows you to view the options file
5. **`!editoptions`**: allows you to edit the options file (*requires a key value pair*) example: `!editoptions minecraft.server_host=mc.javasurvival.com`
6. Put a `.` before any message to send it in-game

## Contributing

Feel free to contact me on discord (Braden @bradenm64), or create an issue on GitHub

## Note
Features such as minecraft chat -> discord chat are currently unavaliable, I'd like to fix this in the future, and continue to add some more commands/config options :)
