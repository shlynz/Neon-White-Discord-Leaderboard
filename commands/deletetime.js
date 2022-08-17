const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { deleteTime } = require("../data/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletetime')
        .setDescription('Allows you to remove a top time of yours')
        .setDMPermission(false)
        .addStringOption(option => 
            option.setName('mission')
                .setDescription('The mission in which the time should be removed')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('stage')
                .setDescription('The stage in which the time should be removed')
                .setRequired(true)
                .setAutocomplete(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const stageId = interaction.options.getString('stage');

        deleteTime(userId, stageId)
            .then(res =>
                new EmbedBuilder()
                    .setTitle('Delete')
                    .setColor(0xFFFFFF)
                    .setDescription(`Deleted your time of ${res.time} on stage ${res.stage.name} in the mission ${res.mission.name}`))
            .then(embed => interaction.reply({embeds: [embed], ephemeral: true}))
    }
}