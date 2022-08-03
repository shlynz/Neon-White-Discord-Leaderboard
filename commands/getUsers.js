require('dotenv').config();
const fetch = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {missions} = require('../missions');
const {getMissions, getStages, getStagesByMission, getTopTimes, getTopTimesByUser} = require('../missions')
const URL = process.env.URL;

function createEmbed(userId){
    return Promise
        .resolve(new EmbedBuilder())
        .then(embed => embed.setColor(0xFFFFFF))
        .then(embed => embed.setTitle(userId))
        .then(embed => embed.setTimestamp())
        .then(embed => {
            return getStages()
                .then(stages => stages.length)
                .then(amountStages => {
                    return getTopTimesByUser(userId)
                        .then(times => times.length)
                        .then(amountTimes => embed.setDescription(`Currently completed ${amountTimes}/${amountStages} stages.`))
                })
        })
        .then(embed => {
            embed.addFields({name: 'Test', value: 'Text'});
            return embed;
        })
        .then(embed =>
            getMissions()
                .then(missions => missions.map(mission => `${mission.id}: ${mission.name}`))
                .then(missions => embed.addFields({name: 'Mission', value: missions.join('\n')}))
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

function mapTimesToMissionStages(times){
    const misisons = new Map();
    times.forEach(time => {
        
    });
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
        .setName('get_users')
        .setDescription('Returns all Users, with their time'),
    async execute(interaction){
        const users = await fetch('http://localhost:8000/users')
            .then(res => res.json())
            .then(json => json);
        console.log(users);
        //interaction.reply(message.join('\n'));
        //interaction.reply({embeds: [createEmbed('Shlynz', 'test')]});
        createEmbed('01')
            .then(embed => interaction.reply({embeds: [embed]}))
    }
}