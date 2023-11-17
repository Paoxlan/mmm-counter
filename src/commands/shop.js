const { SlashCommandBuilder, ComponentType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Upgrades } = require('../modules/upgrades.js');
const { Users } = require('../modules/users.js');
const { createEmbed } = require('../modules/embedTemplate.js');

const leftButton = new ButtonBuilder().setLabel('⬅️').setStyle(ButtonStyle.Primary).setCustomId('left');
const payButton = new ButtonBuilder().setLabel('💸').setStyle(ButtonStyle.Primary).setCustomId('pay');
const rightButton = new ButtonBuilder().setLabel('➡️').setStyle(ButtonStyle.Primary).setCustomId('right');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function getAvailableUpgrades(upgrades, userUpgrades) {
    let availableUpgrades = [];

    for (const category in upgrades) {
        for (const upgrade of upgrades[category]) {
            let hasUpgrade = false;

            for (const userUpgrade of userUpgrades) {
                if (userUpgrade.id === upgrade.id) {
                    hasUpgrade = true;
                    break;
                }
            }
            if (hasUpgrade) continue;

            if (upgrade.requirements) {
                const requirementsLen = upgrade.requirements.length;
                let amount = 0;

                for (const requirement of upgrade.requirements) if (userUpgrades.find(userUpgrade => userUpgrade.id === requirement)) amount += 1;
                if (amount === requirementsLen) availableUpgrades.push(upgrade);
                continue;
            }

            availableUpgrades.push(upgrade);
        }
    }

    return availableUpgrades;
}

function updateComponents(index, upgrades, user) {
    leftButton.setDisabled(false);
    payButton.setDisabled(false);
    rightButton.setDisabled(false);

    user = Users.getUser(user.getUserId()); // Refresh user
    if (!upgrades[index]) return null;

    const upgrade = Upgrades.getUpgrade(upgrades[index].id);

    if (index === 0) leftButton.setDisabled(true);
    if (index === upgrades.length - 1) rightButton.setDisabled(true);
    if (upgrade.getCost(user) > user.getMMM()) payButton.setDisabled(true);

    return new ActionRowBuilder().addComponents([leftButton, payButton, rightButton]);
}

function createShopEmbed(embed, index, upgrades, user, content = '') {
    user = Users.getUser(user.getUserId()); // Refresh user

    const upgrade = upgrades[index] ? Upgrades.getUpgrade(upgrades[index].id) : null;
    const nextUpgrade = upgrades[index + 1];
    const previousUpgrade = upgrades[index - 1];

    embed.setTitle(upgrade ? upgrade.name : 'Shop');
    if (upgrade) embed.setDescription(`${upgrade.getDescription()}\n\nCost: ${upgrade.getCost(user)}\nYou have: ${user.getMMM()} mmms${content ? `\n\n${content}` : ''}`);
    else {
        embed.setDescription('You have all the upgrades!')
        if (previousUpgrade) return createShopEmbed(embed, index - 1, upgrades, user, content);
    }

    embed.setFields([]);
    if (previousUpgrade)
        embed.addFields({ name: 'Previous Upgrade', value: `${previousUpgrade.name}`, inline: true });
    if (nextUpgrade)
        embed.addFields({ name: 'Next Upgrade', value: `${nextUpgrade.name}`, inline: true });

    const components = updateComponents(index, upgrades, user);
    console.log(components);
    
    return { embed: [embed], components: components ? [components] : [], index: index };
}

function shopListEmbed(embed, user, availableUpgrades, upgrades) {
    embed.setTitle('Shop List');
    let description = `mmms: ${user.getMMM()}\nAll upgrades:\n\n`;

    let index = 1;
    for (const category in upgrades) {
        for (const upgrade of upgrades[category]) {
            if (user.getUpgrades().find(userUpgrade => userUpgrade.id === upgrade.id)) description += `~~#${index} ${upgrade.name}; **cost:** ${upgrade.cost}; **ID:** ${upgrade.id}~~\n`;
            else if (availableUpgrades.includes(upgrade)) description += `#${index} ${upgrade.name}; **cost:** ${upgrade.cost}; **ID:** ${upgrade.id}\n`;
            else description += `#${index} Not unlocked yet\n`;

            index += 1;
        }
    }

    embed.setDescription(description);
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Opens the shop.'),
    async execute(interaction) {
        const user = Users.getUser(interaction.user.id);
        const embed = createEmbed(interaction.user);

        if (!user) {
            await interaction.reply({ content: 'You must be registered to use this command.', ephemeral: true });
            return;
        }

        const upgrades = Upgrades.getUpgrades();
        let availableUpgrades = getAvailableUpgrades(upgrades, user.getUpgrades());

        let index = 0;
        
        const shopEmbed = createShopEmbed(embed, index, availableUpgrades, user);
        let message = await interaction.reply({
            embeds: shopEmbed.embed,
            components: shopEmbed.components,
            fetchReply: true
        });
    
        const collectorFilter = (i) => {
            i.deferUpdate();
            return i.user.id === user.getUserId();
        }
    
        const collector = message.createMessageComponentCollector({
            filter: collectorFilter,
            componentType: ComponentType.Button,
            time: 75_000
        });
    
        collector.on('collect', async function (i) {
            let content;
            if (i.customId === 'left') {
                if (index <= 0) return;
                index -= 1;
            }
            if (i.customId === 'right') {
                if (index >= availableUpgrades.length - 1) return;
                index += 1;
            }
            if (i.customId === 'pay') {
                if (!availableUpgrades[index]) return;
                const upgrade = Upgrades.getUpgrade(availableUpgrades[index].id);
                const boughtUpgrade = upgrade.buy(user);
            
                if (!boughtUpgrade)
                    content = `You don't have enough mmm coins to buy this upgrade.`;
                else
                    content = `You succesfully bought ${boughtUpgrade.getName()}!`;
            
                availableUpgrades = getAvailableUpgrades(upgrades, user.getUpgrades());
            }
        
            const updatedEmbed = createShopEmbed(embed, index, availableUpgrades, user, content);
            message = await message.edit({
                embeds: updatedEmbed.embed,
                components: updatedEmbed.components
            });
            
            index = updatedEmbed.index;
        });
    
        collector.on('end', async function (i) {
            message.edit({ content: 'Session ended.', components: []})
                .catch(() => console.log('Message is already deleted.'));
        
            await delay(5_000);
        
            message.delete()
                .catch(() => console.log('Message is already deleted.'));
        });
    }
}