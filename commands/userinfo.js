const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getStages, getTopTimes, getTopTimesByUser, getUser, getTopTimesAsEmbed} = require('../data/db')

function createEmbed(userId){
    return Promise
        .resolve(new EmbedBuilder())
        .then(embed => embed.setColor(0xFFFFFF))
        .then(embed =>
            getUser(userId)
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
            getTopTimesAsEmbed(userId)
                .then(times => embed.addFields(...times))
                
        )
        .catch(error => {
            console.log(error)
            return new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('*Error*')
                .setDescription('Couldn\'t find the specified user in the database :(')
                .setTimestamp()
        }
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