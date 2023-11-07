const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong! Also a test if slash commands are working.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setDescription('Pong! 🏓');
        
        await interaction.reply({ embeds: [embed] });
    }
};