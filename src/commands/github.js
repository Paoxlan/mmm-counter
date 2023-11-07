const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../modules/embedTemplate.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('github')
        .setDescription('Wish to contribute to the bot? Check out the GitHub repository!'),
    async execute(interaction) {
        const embed = createEmbed(interaction.user);

        embed.setTitle('GitHub Repository');
        embed.setDescription('Click the link above to check out the repository.\n\nIf you wish to contribute or distribute the bot, make sure to read the [README](https://github.com/Paoxlan/mmm-counter/blob/main/README.md) and the [LICENSE](https://github.com/Paoxlan/mmm-counter/blob/main/LICENSE)');
        embed.setURL('https://github.com/Paoxlan/mmm-discord-bot');

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}