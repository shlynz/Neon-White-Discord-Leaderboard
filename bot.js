require('dotenv').config()

const fs = require('node:fs');
const path = require('node:path');
const wait = require('node:timers/promises').setTimeout;
const {Client, Collection, GatewayIntentBits, InteractionType} = require('discord.js');
const {missions, getStagesByMissionId, options} = require('./missions')
const token = process.env.BOT_TOKEN;

const stages = [{name:'stage1', value:'stage1'},{name:'stage2', value:'stage2'}];

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
});

// handle interactions
client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()){
        await handleCommands(interaction); 
        return;
    }

    if(interaction.type === InteractionType.ApplicationCommandAutocomplete){
        await handleAutocompletes(interaction);
        return;
    }

    if(interaction.isSelectMenu()){
        await handleSelectMenues(interaction);
        return;
    }
});

function mapToOption(array){
    return array.map(object => {return {name: object.name, value: object.id}})
}

// handle slash commands
async function handleCommands(interaction){
    const command = client.commands.get(interaction.commandName);

    if(!command) return;

    try {
        await command.execute(interaction);
    } catch(error) {
        console.error(error);
        await interaction.reply({content: 'An error has occured :(', ephemeral: true});
    }
};

// handle autocomplete interactions
async function handleAutocompletes(interaction){
    if(interaction.commandName === 'time'){
        await interaction.respond(
            interaction.options.getFocused(true).name === 'mission'
            ? mapToOption(missions)
            : mapToOption(getStagesByMissionId(interaction.options.getString('mission')))
        );
    }
}

// handle selectMenu interactions
async function handleSelectMenues(interaction){
    if(interaction.customId === 'select'){
        console.log(interaction.message.components)
        await interaction.update({components: interaction.message.components});
    }
};

// Login to Discord
client.login(token);