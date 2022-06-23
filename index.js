require('dotenv').config();
const mineflayer = require('mineflayer');
const Discord = require('discord.js');
var connected = true;

const discordBot = new Discord.Client({
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
  intents: [Discord.Intents.FLAGS.GUILD_MESSAGES],
});

let minecraftBot;
botMaker();
function botMaker ()  { 
  minecraftBot = mineflayer.createBot({
    host: 'javasurvival.com',
    username: process.env.EMAIL,
    password: process.env.PASSWORD,
    // port: 63292,
    auth: 'microsoft',
  });
}

// ID variables
const discordServerID = 'serverID';
const chatChannelID = 'channelID';

// Console log bot logins and disconnects
discordBot.on('ready', () => {
  console.log(`The Discord bot ${discordBot.user.username} is ready!`);
});

minecraftBot.on('login', () => {
  console.log('Minecraft bot has logged in!');
});

minecraftBot.on('end', () => {
  console.log('Minecraft bot disconnected from the server.');
});

// Discord message handler
async function toDiscordChat(msg) {
  await discordBot.guilds.cache.get(discordServerID).channels.fetch();
  return discordBot.guilds.cache.get(discordServerID).channels.cache.get(chatChannelID).send({
    content: msg,
  });
}

minecraftBot.on('message', (message) => {
  if (message.toString().includes("joined the game") || message.toString().includes("left the game")) {
    toDiscordChat('**' + message.toString() + '**');
  } else {
    toDiscordChat(message.toString());
  }
})

discordBot.on('messageCreate', async (message) => {

    if (message.author.id === discordBot.user.id || message.channel.id !== chatChannelID || message.author.bot) return;
		
	if (connected === false && message.toString() === '?join') {
		connected = !connected
		console.log(connected)
		toDiscordChat('***!Going Online!***')
		console.log("This is pid " + process.pid);
setTimeout(function () {
    process.on("exit", function () {
        require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached : true,
            stdio: "inherit"
        });
    });
    process.exit();
}, 5000);
	} else if (message.toString() === '?leave') {
		toDiscordChat('***!Went Offline!***')
		minecraftBot.quit()
		connected = !connected;
		console.log(connected)
	} else {
	minecraftBot.chat(message.content);
    await message.delete()
	}
});

discordBot.login(process.env.BOT_TOKEN);