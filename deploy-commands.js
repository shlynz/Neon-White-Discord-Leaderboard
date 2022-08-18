require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const {Routes} = require('discord.js');
const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const rest = new REST({ version: '10' }).setToken(token);

const commands = []
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);