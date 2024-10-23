const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// paths for ecosystem.json and .env
const configPath = path.join(__dirname, 'ecosystem.json');
const envPath = path.join(__dirname, '.env');

// convert JSON to env
function jsonToEnv(config) {
    const envData = [
        // Minecraft user login (sensitive)
        `MINECRAFT_EMAIL=${config.minecraft.email}`,
        `MINECRAFT_PASSWORD=${config.minecraft.password}`,

        // Minecraft server configuration
        `MINECRAFT_SERVER_HOST=${config.minecraft.server_host}`,
        `MINECRAFT_SERVER_PORT=${config.minecraft.server_port}`,
        `MINECRAFT_AUTH_TYPE=${config.minecraft.auth_type}`,

        // Discord configuration
        `DISCORD_SERVER_ID=${config.discord.server_id}`,
        `DISCORD_COMMAND_CENTER_ID=${config.discord.command_center_id}`,
        `DISCORD_BOT_TOKEN=${config.discord.bot_token}`,

        // Bot settings
        `SETTINGS_AUTO_RECONNECT=${config.settings.auto_reconnect}`,
    ];

    return envData.join('\n');
}

// read ecosystem.json
fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Failed to read ecosystem.json:', err);
        return;
    }

    let config;
    try {
        config = JSON.parse(data);
    } catch (jsonErr) {
        console.error('Error parsing ecosystem.json:', jsonErr);
        return;
    }

    // convert JSON to .env
    const envContent = jsonToEnv(config);

    fs.writeFile(envPath, envContent, (writeErr) => {
        if (writeErr) {
            console.error('Error writing ecosystem.env:', writeErr);
        } else {
            console.log('.env created successfully');
            // run bot.js
            exec('node bot.js', (execErr, stdout, stderr) => {
                if (execErr) {
                    console.error(`Error executing bot.js: ${execErr.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        }
    });
});
