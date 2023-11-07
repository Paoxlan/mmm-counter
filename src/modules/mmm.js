const fs = require('fs');
const path = require('path');
const { Users } = require('./users.js');
const { Upgrades } = require('./upgrades.js');
const jsonHelpers = require('./json-helpers.js');

// Variables //
const pow = 1.75;
// END Variables //

function applyUpgrades(user, category, defaultValue) {
    const userUpgrades = user.getUpgrades();
    let userEffect = defaultValue ?? 1;

    for (const userUpgrade of userUpgrades) {
        const upgrade = Upgrades.getUpgrade(userUpgrade.id);
        if (!upgrade) continue;
        if (upgrade.category !== category) continue;
        if (!upgrade.getEffect()) continue;

        userEffect = upgrade.getEffect()(userEffect, user);
    }

    return userEffect;
}

module.exports = {
    MMM: class MMM {
        static isMMM(message) {
            const textContent = message.toString().toLowerCase().split(' ');

            for (let index = 0; index < textContent.length; index++) {
                const word = textContent[index];
                if (word.includes('mmm') && word.startsWith('m')) return true;
            }
            
            return false;
        }

        static nextRequirement = (user) => Math.ceil(2 * user.rank ** pow);

        static calculateRank(user) {
            const nextRequirement = this.nextRequirement(user);
        
            if (user.count < nextRequirement) return user.rank;
        
            return user.rank + 1;
        }

        static updateUser(message) {
            const userId = message.author.id;
            let user = Users.getUser(userId);
            
            let messageContent = '';

            if (!user) {
                Users.createUser(userId);
                message.reply(`${message.author.displayName} has said "mmm" for the first time!\n\nAlso you're rank 1 now.`);
                return;
            }

            for (const upgrade of user.getUpgrades()) {
                const extra = upgrade.extra;
                if (!extra) continue;

                if (typeof extra.hasSpoken !== 'undefined') extra.hasSpoken = true;
            }

            const oldRank = user.getRank();

            user.setCount(user.getCount() + applyUpgrades(user, 'count'));
            user.setMMM(user.getMMM() + applyUpgrades(user, 'mmm'));
            user.setRank(this.calculateRank(user));

            messageContent += `${message.author.displayName} has said "mmm" ${user.getCount()} times! You have ${user.getMMM()} mmms.`;
            if (oldRank !== user.getRank()) messageContent += `\n\nAlso you ranked up to rank ${user.getRank()}!`;

            message.reply(messageContent);
        }
    }
}