const {SlashCommandBuilder} = require('discord.js');
const {missions, choices} = require('../missions');

const firstChoices = [
    {name: "first", value: "1"},
    {name: "second", value: "2"},
    {name: "third", value: "3"}
]
const secondChoice = [
    {name: "firstSecond", value: "1"}
]
const secondChoice2 = [
    {name: "secondSecond", value: "1"}
]
const secondChoice3 = [
    {name: "thirdSecond", value: "1"}
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pb')
        .setDescription('Registers a new PB for you')
        .setDMPermission(false)
        .addSubcommand
        .addStringOption(option => 
            option.setName('level')
                .setDescription('The level in which the new PB was made')
                .setRequired(true)
                .addChoices(...firstChoices))
        .addStringOption(option => 
            option.setName('time')
                .setDescription('Your achieved PB')
                .setRequired(true)),
    async execute(interaction){
        console.log(interaction)
        await interaction.reply('Logged');
    },
};