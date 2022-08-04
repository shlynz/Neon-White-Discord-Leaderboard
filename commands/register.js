const { SlashCommandBuilder } = require("discord.js");
const { getUserName, insertUser } = require("../db");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers yourself to the leaderboard'),
    async execute(interaction) {
        const target = interaction.user
        getUserName(target.id)
            .then(user => user.id || interaction.reply('You\'re already registered to the leaderboard'))
            .catch(error =>
                insertUser(target)
                    .then(res => interaction.reply('You were successfully registered to the leaderboard.'))
                    .catch(error => interaction.reply('Something went wrong while inserting you to the leaderboard...'))
            )
    }
}