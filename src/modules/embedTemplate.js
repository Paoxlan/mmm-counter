const { EmbedBuilder } = require('discord.js');

module.exports = {
    createEmbed(user) {
        const embed = new EmbedBuilder()
            .setColor([61, 164, 92])
            .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() });

        return embed;
    }
}