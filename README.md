# MCDiscordAltHub
A way to link your alts to a discord channel. Run the script on something like a raspberry pi and you can control your alt's chat, and weather they are online or offline.  

this is all possible because of mineflayer (https://github.com/PrismarineJS/mineflayer)  

# Setup
make sure you have node.js + npm installed.  

npm install mineflayer  
npm install discord.js  
npm install dotenv  

rename env.txt to just .env  

create a discord bot, get it's token, get your discord server's ID, and the channel ID of where you want your bot to be located. This can be changed.  

fill in the missing information inside index.js and inside .env  

finally, make sure everything is inside a folder, and run the appropriate runnable for your system (if you're on linux you may have to type "sudo chmod +x linux-runner" into the terminal)
