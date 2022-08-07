const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { getStageById, getUser, insertTime } = require('../db');

const isShortTimestamp = (time) => time.match(/\d{1,2}\.\d{3}/g)?.[0] === time;
const isLongTimestamp = (time) =>  time.match(/\d{1,2}:\d{2}\.\d{3}/g)?.[0] === time;
const isValidTime = (time) => isShortTimestamp(time) || isLongTimestamp(time);

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
                .setDescription('Your achieved time (Format either MM:SS:sss or SS:sss)')
                .setRequired(true)),
    async execute(interaction){
        const userId = interaction.user.id;
        const missionId = interaction.options.getString('mission');
        const stageId = interaction.options.getString('stage');
        const timeParam = interaction.options.getString('time');

        Promise.resolve(getUser(userId))
            .then(user => {
                if(user){
                    if(isShortTimestamp(timeParam)){
                        return `00:${timeParam.padStart(6, '0')}`;
                    } else if (isLongTimestamp(timeParam)) {
                        return timeParam.padStart(9, '0');
                    } else {
                        throw 'The time does not meet the required format of either MM:SS:sss or SS:sss.'
                    }
                } else {
                    throw 'You aren\'t registered to the leaderboard yet!'
                }
            })
            .then(time =>
                getStageById(stageId)
                    .then(stage =>
                        insertTime(userId, missionId, stageId, time)
                            .then(res => new EmbedBuilder()
                            .setTitle('Time added')
                            .setColor(0xFFFFFF)
                            .setDescription(`Your time of ${time} was added to the stage "${stage.name}" in the mission "${stage.mission.name}".`))
                    )
            )
            .catch(error =>
                new EmbedBuilder()
                    .setTitle('*ERROR*')
                    .setColor(0xFF0000)
                    .setDescription(error)
            )
            .then(embed => interaction.reply({embeds: [embed]}))
    }
};