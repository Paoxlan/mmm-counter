const { SlashCommandBuilder } = require("discord.js");
const { MMM } = require("../modules/mmm.js");
const { Users } = require("../modules/users.js");
const { createEmbed } = require('../modules/embedTemplate.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Shows a list of the top 10 users.'),
    async execute(interaction, client) {
        const embed = createEmbed(interaction.user);

        const userArray = Users.getUsersJSON();

        if (!userArray.length) return await interaction.reply({ content: "No users were found.", ephemeral: true });

        const sortedUserArray = userArray.sort((a, b) => parseInt(b.count) - parseInt(a.count)).slice(0, 10);

        let description = '';
        for (let i = 0; i < sortedUserArray.length; i++) {
            const user = sortedUserArray[i];
            const userObject = await client.users.fetch(user.user_id)
                .catch(() => { return { globalName: 'Unknown' }});

            console.log(userObject);

            description += `${i + 1}# <@${user.user_id}> | ${userObject.globalName}: ${user.count} mmm's\n`;
        }

        embed.setTitle('mmm Leaderboard:');
        embed.setDescription(description);
        interaction.reply({ embeds: [embed] });
    }
}