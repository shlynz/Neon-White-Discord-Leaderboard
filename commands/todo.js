const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopTimes, getUser } = require('../data/db')

function createEmbed(userId){
    return Promise
        .resolve(new EmbedBuilder())
        .then(embed => embed.setColor(0xFFFFFF))
        .then(embed => getUser(userId).then(user => embed.setTitle(user.name)))
        .then(embed => embed.setTimestamp())
        .then(embed =>
            // get top times and filter for not set by user
            getTopTimes()
                .then(times => times.filter(time => time.userId != userId))
                .then(times => Promise.all(times?.map(time => `${time.missionName} - ${time.stageName}: ${time.stageTime} by ${time.userName}`)))
                .then(stringTimes => stringTimes?.join('\n'))
                .then(joinedStringTimes => embed.setDescription(`Your current TODOs are as follows:\n\n${joinedStringTimes || 'Nothing, good job!'}`))
        )
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Checks for stages you have to improve :)')
    .setDMPermission(false),
    async execute(interaction){
        const userId = interaction.user.id;
        createEmbed(userId)
            .then(embed => interaction.reply({embeds: [embed]}))
    }
}