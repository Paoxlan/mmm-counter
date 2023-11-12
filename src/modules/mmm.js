const { Users } = require('./users.js');
const { Upgrades } = require('./upgrades.js');

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

        static updateUser(message) {
            const userId = message.author.id;
            let user = Users.getUser(userId);
            
            let messageContent = '';

            if (!user) {
                Users.createUser(userId);
                message.reply(`${message.author.displayName} has said "mmm" for the first time!`);
                return;
            }

            for (const upgrade of user.getUpgrades()) {
                const extra = upgrade.extra;
                if (!extra) continue;

                if (typeof extra.hasSpoken !== 'undefined') extra.hasSpoken = true;
            }

            user.setCount(user.getCount() + applyUpgrades(user, 'count'));
            user.setMMM(user.getMMM() + applyUpgrades(user, 'mmm'));

            messageContent += `${message.author.displayName} has said "mmm" ${user.getCount()} times! You have ${user.getMMM()} mmm coins.`;

            message.reply(messageContent);
        }
    }
}