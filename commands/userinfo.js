require('dotenv').config();
const fetch = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {getMissions, getStages, getStagesByMission, getTopTimes, getTopTimesByUser, getTime, getUserName} = require('../db')
const URL = process.env.URL;

function createEmbed(userId){
    return Promise
        .resolve(new EmbedBuilder())
        .then(embed => embed.setColor(0xFFFFFF))
        .then(embed =>
            getUserName(userId)
                .then(user => embed.setTitle(user.name))
            )
        .then(embed => embed.setTimestamp())
        .then(embed =>
            // get all stages
            getStages()
                .then(stages => stages.length)
                .then(amountStages =>
                    // get users best times
                    getTopTimes(userId)
                        .then(times => times.length)
                        .then(amountTimes =>
                            // get top times of user
                            getTopTimesByUser(userId)
                                .then(topTimes => topTimes.length)
                                .then(amountTopTimes => embed.setDescription(`Currently completed ${amountTimes}/${amountStages} stage(s), with ${amountTopTimes} top time(s).`))
                        )
                )
        )
        .then(embed =>
            // get all missions
            getMissions()
                .then(missions =>
                    // map every mission to a string list of the stages and their times 
                    Promise.all(
                        missions.map(mission =>
                            // get the stages of the given mission
                            getStagesByMission(mission.id)
                                .then(stages => 
                                    Promise.all(
                                        // map the stages to a string of the name and the time, NA if no time was found
                                        stages.map(stage =>
                                            getTime(stage.id)
                                                .then(result => `${stage.name}: ${result?.time || 'NA'}`)
                                        )
                                    )
                                    .then(times => times.join('\n'))
                                )
                                // return the result in the required field format for the embed
                                .then(stageTimes => {
                                    return {name: mission.name, value: stageTimes, inline: true}
                                })
                        )
                    )
                    // add all the missions, each as a separate field
                    .then(times => embed.addFields(...times))
                )
        )
        .catch(error => 
            new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('*Error*')
                .setDescription('Couldn\'t find the specified user in the database :(')
                .setTimestamp()
        );
}

module.exports = {
    data : new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Returns the times of the specified user, or yourself if noone specified')
        .addUserOption(option => option.setName('target').setDescription('The user to output')),
    async execute(interaction){
        const target = interaction.options.getUser('target') || interaction.user
        createEmbed(target.id)
            .then(embed => interaction.reply({embeds: [embed]}))
    }
}