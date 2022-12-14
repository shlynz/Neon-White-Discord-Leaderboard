require('dotenv').config()

const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, GatewayIntentBits, InteractionType} = require('discord.js');
const { getMissions, getStagesByMission, insertTime } = require('./data/db');
const readline = require('readline');
const token = process.env.BOT_TOKEN;

// create client instance
const client = new Client({intents: [GatewayIntentBits.Guilds]});

// adding the commands into a collection inside the client instance
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// when client is ready, run this once
client.once('ready', () => {
    console.log('Ready!');
    //bulkregister();
});

// handle interactions
client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()){
        return handleCommands(interaction);
    }

    if(interaction.type === InteractionType.ApplicationCommandAutocomplete){
        return handleAutocompletes(interaction);
    }

    if(interaction.isSelectMenu()){
        return handleSelectMenues(interaction);
    }
});

// handle slash commands
function handleCommands(interaction){
    const command = client.commands.get(interaction.commandName);

    if(!command) return;

    try {
        command.execute(interaction);
    } catch(error) {
        console.error(error);
        interaction.reply({content: 'An error has occured :(', ephemeral: true});
    }
};

// handle autocomplete interactions
function handleAutocompletes(interaction){
    const autocompleteCommands = ['time', 'toptime', 'deletetime']
    if(autocompleteCommands.includes(interaction.commandName)){
        const missionId = interaction.options.getString('mission');
        const focusedOption = interaction.options.getFocused().toLowerCase();

        Promise.resolve(interaction.options.getFocused(true).name === 'mission')
            .then(isMission => {
                if(isMission){
                    return getMissions()
                } else {
                    return getStagesByMission(missionId)
                }
            })
            .then(result => mapToOption(result))
            .then(options => options.filter(option => option.name.toLowerCase().includes(focusedOption)))
            .then(filteredOptions => interaction.respond(filteredOptions))
            .catch(error => interaction.respond([]))
    }
}

// maps json from the db to options for autocomplete
function mapToOption(array){
    return array.map(object => {return {name: object.name, value: object.id}})
}

// Login to Discord
client.login(token);

// registers a bunch of times in bulk
// usefull for initial time registering
function bulkregister(){
    const file = readline.createInterface({
        input: fs.createReadStream('./data/bulkregister.txt'),
        output: process.stdout,
        terminal: false
    });
    file.on('line', line => {
        let [userId, missionId, stageId, time] = line.split(';');
        missionId = missionId?.padStart(2, '0');
        stageId = missionId + stageId?.padStart(2, '0');
        insertTime(userId, missionId, stageId, time);
    });
}