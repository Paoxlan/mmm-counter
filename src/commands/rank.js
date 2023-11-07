const { SlashCommandBuilder } = require('discord.js');
const { MMM } = require('../modules/mmm.js');
const { Users } = require('../modules/users.js');
const { createEmbed } = require('../modules/embedTemplate.js');
const { readJSON } = require('../modules/json-helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Replies with your rank!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get the rank of.')    
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        let user;
        
        const embed = createEmbed(interaction.user);

        if (target) {
            user = Users.getUser(target.id);
            embed.setThumbnail(target.displayAvatarURL());
        }
        else {
            user = Users.getUser(interaction.user.id);
            embed.setThumbnail(interaction.user.displayAvatarURL());
        }

        if (!user) {
            embed.setDescription(`<@${target ? target.id : interaction.user.id}>\nRank: 0\nNext requirement: [0/1]`);
            interaction.reply({ embeds: [embed] });
            return;
        }
        const nextRequirement = MMM.nextRequirement(user);
        embed.setDescription(`<@${user.user_id}>\nRank: ${user.rank}\nNext requirement:[${user.count}/${nextRequirement}]`);
        interaction.reply({ embeds: [embed]});
    }
}