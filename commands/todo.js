const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopTimes, getUser, getTodoAsEmbed } = require('../data/db')

function createEmbed(userId){
    return Promise
        .resolve(new EmbedBuilder())
        .then(embed => embed.setColor(0xFFFFFF))
        .then(embed => getUser(userId).then(user => embed.setTitle(user.name)))
        .then(embed => embed.setDescription('Your current TODOs are as follows:\n'))
        .then(embed => embed.setTimestamp())
        .then(embed =>
            getTodoAsEmbed(userId)
                .then(todos => todos[0] ? embed.addFields(...todos) : embed.addFields(todos))
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