const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: node updateConfig.js <key> <value>');
    process.exit(1);
}

const [keyPath, value] = args;
const keys = keyPath.split('.'); // Split key path by '.'

// Define the path to your JSON config file and .env file
const configFilePath = path.join(__dirname, 'ecosystem.json');
const envFilePath = path.join(__dirname, '.env');

// Function to convert JSON config to .env format
function jsonToEnv(config) {
    const envData = [
        `MINECRAFT_EMAIL=${config.minecraft.email}`,
        `MINECRAFT_PASSWORD=${config.minecraft.password}`,
        `MINECRAFT_SERVER_HOST=${config.minecraft.server_host}`,
        `MINECRAFT_SERVER_PORT=${config.minecraft.server_port}`,
        `MINECRAFT_AUTH_TYPE=${config.minecraft.auth_type}`,
        `DISCORD_SERVER_ID=${config.discord.server_id}`,
        `DISCORD_COMMAND_CENTER_ID=${config.discord.command_center_id}`,
        `DISCORD_BOT_TOKEN=${config.discord.bot_token}`,
        `SETTINGS_AUTO_RECONNECT=${config.settings.auto_reconnect}`,
    ];
    return envData.join('\n');
}

// Read the existing configuration
fs.readFile(configFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading ecosystem.json:', err);
        process.exit(1);
    }

    // Parse the JSON data
    let config;
    try {
        config = JSON.parse(data);
    } catch (jsonErr) {
        console.error('Error parsing JSON:', jsonErr);
        process.exit(1);
    }

    // Navigate to the specified section and key
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            console.error(`Invalid section: ${keys[i]} does not exist.`);
            process.exit(1);
        }
        current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (current[lastKey] === undefined) {
        console.error(`Invalid key: ${lastKey} does not exist.`);
        process.exit(1);
    }

    // Determine the value type: boolean or string
    const isBoolean = value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
    current[lastKey] = isBoolean ? (value.toLowerCase() === 'true') : value; // Keep it as a string

    // Write the updated configuration back to the file
    fs.writeFile(configFilePath, JSON.stringify(config, null, 4), (writeErr) => {
        if (writeErr) {
            console.error('Error writing to ecosystem.json:', writeErr);
            process.exit(1);
        }

        console.log(`Updated ${keyPath} to ${current[lastKey]}`);

        // Convert JSON to .env format and write to .env file
        const envContent = jsonToEnv(config);
        fs.writeFile(envFilePath, envContent, (envWriteErr) => {
            if (envWriteErr) {
                console.error('Error writing to .env:', envWriteErr);
                process.exit(1);
            }
        });
    });
});
