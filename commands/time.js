const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('Registers a new time for you')
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName('mission')
                .setDescription('The mission in which the new time was achieved in')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('stage')
                .setDescription('The stage in which the new time was achieved in')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('time')
                .setDescription('Your achieved time')
                .setRequired(true)),
    async execute(interaction){
        const missionId = interaction.options.getString('mission');
        const stageId = interaction.options.getString('stage');
        const time = interaction.options.getString('time');
        const message = 'Added your new time of ' + time + ' for the stage ' + stageId + ' in the mission ' + missionId;
        interaction.reply(message);
    }
};