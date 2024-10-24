module.exports = {
    apps: [{
        name: 'Minecraft-Discord Alt Hub',
        script: 'mcdah.js',
        env: {
            NODE_ENV: 'production',

            MINECRAFT_EMAIL: 'your_email',
            MINECRAFT_PASSWORD: 'your_password',
            MINECRAFT_AUTH_TYPE: 'microsoft',

            DISCORD_BOT_TOKEN: 'bot_token',
            DISCORD_SERVER_ID: 'server_id',
            DISCORD_CHANNEL_ID: 'channel_id'
        }
    }]
}

