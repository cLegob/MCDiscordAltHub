# MCDiscordAltHub

MCDiscordAltHub is a bot that connects a Discord server with a Minecraft server, allowing for real-time chat synchronization between both platforms.

## Features

- Real-time chat relay between Discord and Minecraft.
- Commands for checking player status and managing connections.

## Prerequisites

- **Node.js** (version 16 or later)
- **npm** (Node package manager)
- **Discord Bot Token**
- **Minecraft Account Credentials**

## Getting Started

Follow these steps to set up and run the bot locally.

### 1. Clone the Repository

Open a terminal and run the following command:

git clone https://github.com/yourusername/MCDiscordAltHub.git cd MCDiscordAltHub

bash


### 2. Install Dependencies

Run the following command to install the required packages:

npm install mineflayer discord.js

mathematica


### 3. Set Environment Variables

Set the following environment variables in your terminal:

export BOT_TOKEN=your-bot-token export EMAIL=your-email export PASSWORD=your-password export AUTH_TYPE=microsoft # Use 'microsoft' or another authentication type if needed

shell


### 4. Running the Bot

#### Windows

Run the following commands in Command Prompt or PowerShell:

cd MCDiscordAltHub npm start

shell


#### Linux

Run the following commands in your terminal:

cd MCDiscordAltHub npm start

markdown


## Bot Commands

- `?join`: Reconnects the Minecraft bot if disconnected.
- `?reconnect`: Disconnects the Minecraft bot and attempts to reconnect.
- `?leave`: Disconnects the Minecraft bot and stops auto-reconnection.
- `?playerlist`: Displays the current online players on the Minecraft server.
- Any message sent in the Discord channel will be forwarded to the Minecraft chat.

## Troubleshooting

- Check the console for error messages during startup.
- Ensure your Discord bot token and Minecraft credentials are correct.
- Verify that the Discord bot has permissions to send messages in the specified channel.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Mineflayer for Minecraft bot functionalities.
- Discord.js for Discord interactions.
