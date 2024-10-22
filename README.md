Got it! Here's the updated documentation with the correct name, MCDiscordAltHub:
MCDiscordAltHub Setup Guide

This guide will walk you through the process of setting up and running MCDiscordAltHub on Windows or Linux.
Prerequisites

Make sure you have the following installed:

    Node.js and npm (Node Package Manager)
    PM2 (for managing Node.js processes)

For Windows Users
Step 1: Install Node.js and npm

    Download and install Node.js from the official website.
        During installation, ensure to check the option: Add to PATH.

    After installation, verify the installation using the following commands in Command Prompt or PowerShell:

    bash

    node -v
    npm -v

Step 2: Install PM2

    Open Command Prompt or PowerShell and install PM2 globally:

    bash

npm install pm2@latest -g

Verify PM2 installation:

bash

    pm2 -v

Step 3: Clone or Set Up MCDiscordAltHub

    Clone the MCDiscordAltHub repository:

    bash

    git clone https://github.com/your-repository-url
    cd mcdiscordalthub

    Alternatively, you can manually create the bot files (bot.js, config.json, ecosystem.json) in your working directory.

Step 4: Install Required Libraries

In the MCDiscordAltHub directory, install the required Node.js libraries:

bash

npm install mineflayer discord.js fs

Step 5: Configure MCDiscordAltHub

    Edit the config.json file to include your Minecraft server and Discord channel details. Example:

    json

{
  "discordServerID": "your-discord-server-id",
  "chatChannelID": "your-discord-channel-id",
  "minecraftServer": {
    "host": "minecraft.server",  
    "port": 25565 
  }
}

Edit the ecosystem.json file to include your bot credentials:

json

    {
      "apps": [
        {
          "name": "mcdiscordalthub",
          "script": "./bot.js",
          "env": {
            "BOT_TOKEN": "your-discord-bot-token",
            "EMAIL": "your-minecraft-email",
            "PASSWORD": "your-minecraft-password",
            "AUTH_TYPE": "microsoft"
          }
        }
      ]
    }

Replace all the placeholders (your-discord-server-id, your-discord-bot-token, etc.) with the actual values.
Step 6: Running MCDiscordAltHub

    Start MCDiscordAltHub with PM2:

    bash

pm2 start ecosystem.json

Check MCDiscordAltHub's status:

bash

pm2 status

View logs:

bash

pm2 logs

Restart MCDiscordAltHub (if needed):

bash

pm2 restart mcdiscordalthub

Stop MCDiscordAltHub:

bash

    pm2 stop mcdiscordalthub

Step 7: Start MCDiscordAltHub on System Boot (Optional)

    To configure MCDiscordAltHub to start automatically on system boot, run:

    bash

pm2 startup

This will output a command. Run it as administrator in Command Prompt or PowerShell.

Save the current PM2 process:

bash

    pm2 save

For Linux Users
Step 1: Install Node.js and npm

    Open Terminal and update your package list:

    bash

sudo apt update

Install Node.js and npm:

bash

sudo apt install nodejs npm

Verify the installation:

bash

    node -v
    npm -v

Step 2: Install PM2

    Install PM2 globally:

    bash

sudo npm install pm2@latest -g

Verify PM2 installation:

bash

    pm2 -v

Step 3: Clone or Set Up MCDiscordAltHub

    Clone the MCDiscordAltHub repository:

    bash

    git clone https://github.com/your-repository-url
    cd mcdiscordalthub

    Alternatively, you can manually create the bot files (bot.js, config.json, ecosystem.json) in your working directory.

Step 4: Install Required Libraries

In the MCDiscordAltHub directory, install the required Node.js libraries:

bash

npm install mineflayer discord.js fs

Step 5: Configure MCDiscordAltHub

    Edit the config.json file to include your Minecraft server and Discord channel details. Example:

    json

{
  "discordServerID": "your-discord-server-id",
  "chatChannelID": "your-discord-channel-id",
  "minecraftServer": {
    "host": "minecraft.server",  
    "port": 25565 
  }
}

Edit the ecosystem.json file to include your bot credentials:

json

    {
      "apps": [
        {
          "name": "mcdiscordalthub",
          "script": "./bot.js",
          "env": {
            "BOT_TOKEN": "your-discord-bot-token",
            "EMAIL": "your-minecraft-email",
            "PASSWORD": "your-minecraft-password",
            "AUTH_TYPE": "microsoft"
          }
        }
      ]
    }

Replace all the placeholders (your-discord-server-id, your-discord-bot-token, etc.) with the actual values.
Step 6: Running MCDiscordAltHub

    Start MCDiscordAltHub with PM2:

    bash

pm2 start ecosystem.json

Check MCDiscordAltHub's status:

bash

pm2 status

View logs:

bash

pm2 logs

Restart MCDiscordAltHub (if needed):

bash

pm2 restart mcdiscordalthub

Stop MCDiscordAltHub:

bash

    pm2 stop mcdiscordalthub

Step 7: Start MCDiscordAltHub on System Boot (Optional)

    To configure MCDiscordAltHub to start automatically on system boot, run:

    bash

pm2 startup

This will output a command. Run it with sudo in Terminal.

Save the current PM2 process:

bash

pm2 save
