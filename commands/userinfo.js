require('dotenv').config();
const fetch = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {missions, getTime} = require('../db');
const {getMissions, getStages, getStagesByMission, getTopTimes, getTopTimesByUser, getUserName} = require('../db')
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
            getStages()
                .then(stages => stages.length)
                .then(amountStages =>
                    getTopTimes(userId)
                        .then(times => times.length)
                        .then(amountTimes =>
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
        );
}

function getUserTimes(userId){
    const times = [];
    fetch(URL + "/stages")
        .then(res => res.json())
        .then(stages => {
            stages.forEach(async stage => {
                return await fetch(`${URL}/stages/times/${stage.id}/user/${userId}/top`)
                    .then(res => res.json())
                    .then(json => json[0])
                    .then(entry => {
                        if(!entry) return {id: 'nix'};
                        console.log(entry)
                        const id = entry.stageId;
                        const missionName = entry.mission.name;
                        const stageName = entry.stage.name;
                        const stageTime = entry.time;
                        times.push({id, missionName, stageName, stageTime});
                    });
        })
    })
    return times;
}

/*
const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Some title')
	.setURL('https://discord.js.org/')
	.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
	.setDescription('Some description here')
	.setThumbnail('https://i.imgur.com/AfFp7pu.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setImage('https://i.imgur.com/AfFp7pu.png')
	.setTimestamp()
	.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

channel.send({ embeds: [exampleEmbed] });
*/

module.exports = {
    data : new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Returns your times'),
    async execute(interaction){
        createEmbed(interaction.user.id)
            .then(embed => interaction.reply({embeds: [embed]}))
    }
}