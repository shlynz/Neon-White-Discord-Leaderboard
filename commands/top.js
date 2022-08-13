const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder } = require("discord.js");
const { getStageTopTimeAsEmbed, getMissionTopTimesAsEmbed, getTopTimesAsEmbed } = require("../data/db");

function getNeededEmbed(missionId, stageId){
    if(missionId){
        if(stageId){
            return getStageTopTimeAsEmbed(stageId);
        } else {
            return getMissionTopTimesAsEmbed(missionId);
        }
    } else {
        if(stageId){
            throw "Please select the mission the stage is supposed to be in";
        } else {
            return getTopTimesAsEmbed();
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toptime')
        .setDescription('Reports the top time for the specified query.')
        .addStringOption(option => 
            option.setName('mission')
                .setDescription('The mission to show the times of.')
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('stage')
                .setDescription('The specific stage to see the top times of.')
                .setAutocomplete(true)),
    async execute(interaction){
        const missionId = interaction.options.getString('mission');
        const stageId = interaction.options.getString('stage');
        
        Promise.resolve(new EmbedBuilder())
            .then(embed => embed.setTitle('Current Top Time(s)'))
            .then(embed => embed.setColor(0xFFFFFF))
            .then(embed => embed.setTimestamp())
            .then(embed =>
                getNeededEmbed(missionId, stageId)
                    .then(fields => fields[0] ? embed.addFields(...fields) : embed.addFields(fields))
                    
            )
            .then(embed => interaction.reply({embeds: [embed]}))
            .catch(error => {
                console.log(error)
                interaction.reply({embeds: [
                    new EmbedBuilder()
                    .setTitle('Error')
                    .setColor(0xFF0000)
                    .setDescription(error)
                    .setTimestamp()
                ]})
            })

    }
}