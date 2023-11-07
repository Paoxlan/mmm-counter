const fs = require('fs');
const path = require('path');
const { Users } = require('./users.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const upgrades = {
    mmm: [
        {
            id: 1,
            name: "Starter MMMer",
            description: `Adds 1 extra mmm currency every "mmm".\n"mmmm"`,
            cost: 25,
            effect: function (value) {
                return value + 1;
            },
        },
        {
            id: 2,
            name: "MMMer",
            description: `Adds 1 extra mmm currency every "mmm".\n"mmmmm"`,
            cost: 100,
            requirements: [
                1
            ],
            effect: function (value) {
                return value + 1;
            }
        },
        {
            id: 3,
            name: "MMMer II",
            description: `Adds 1 extra mmm currency every "mmm".\n"mmmmmm"`,
            cost: 333,
            requirements: [
                2
            ],
            effect: function (value) {
                return value + 1;
            }
        },
        {
            id: 500,
            name: "Financial Advisor",
            description: `Gain 25% more mmm currency for every "mmm".`,
            cost: 685,
            requirements: [
                1
            ],
            effect: function (value) {
                return value * 1.25;
            }
        },
        {
            id: 501,
            name: "Office",
            description: `Get access to the office upgrades.\n"We're starting business."`,
            cost: 250
        },
        {
            id: 600,
            name: "MMM luck",
            description: `Get a 15x multiplier bonus by random chance (1%).\n`,
            cost: 777,
            requirements: [
                1,
            ],
            effect: function (value) {
                if (Math.floor(Math.random() * 100) !== 0) return value;

                return value * 15;
            }
        },
        {
            id: 900,
            name: "Inner Thoughts",
            description: `Passively gain 2 mmm currency every 5 seconds.\nWarning: This upgrade will get unequipped if you say "mmm".\n""mmm""`,
            cost: 1000,
            hasSpoken: false,
            hasOnEquip: true,
            onEquip: async function (user) {
                const upgrade = user.getUpgrades().find(upgrade => upgrade.id === this.id);
                if (!upgrade) return;

                const extra = upgrade.extra;
                if (extra.hasSpoken === undefined) return;

                while (!extra.hasSpoken) {
                    user.setMMM(user.getMMM() + 2);
                    await delay(5000);
                    user = Users.getUser(user.getUserId());
                    extra.hasSpoken = user.getUpgrades().find(upgrade => upgrade.id === this.id).extra.hasSpoken;
                }

                user.removeUpgrade(this.id);
            }
        },
        {
            id: 901,
            name: "Office Worker",
            description: `Passively gain 1 mmm currency every 20 seconds.\n"we need to talk about your mps reports"`,
            cost: 500,
            hasOnEquip: true,
            requirements: [
                501
            ],
            onEquip: async function (user) {
                while (true) {
                    user.setMMM(user.getMMM() + 1);
                    await delay(20_000);
                    user = Users.getUser(user.getUserId());
                }
            }
        },
        {
            id: 902,
            name: "Office Worker II",
            description: `Passively gain 2 mmm currency every 20 seconds.\n"Do we really need to talk about your mps reports?"`,
            cost: 1000,
            hasOnEquip: true,
            requirements: [
                901
            ],
            onEquip: async function (user) {
                while (true) {
                    user.setMMM(user.getMMM() + 2);
                    await delay(20_000);
                    user = Users.getUser(user.getUserId());
                }
            }
        },
    ],
    count: [
        {
            id: 1000,
            name: "Double Speak",
            description: `Gain 1 extra mmm count\n"Is this guy speaking in tongues?"`,
            cost: 6666,
            requirements: [
                1,
                3
            ],
            effect: function (value) {
                return value + 1;
            }
        },
        {
            id: 1001,
            name: "Triple Speak",
            description: `Gain 1 extra mmm count\n"He listened to the winds, and he spoke."`,
            cost: 66666,
            requirements: [
                1000
            ],
            effect: function (value) {
                return value + 1;
            }
        },
        {
            id: 1500,
            name: "A Thousand Minds",
            description: `For every 1000 mmm count, gain 1 extra count.\n"Praise the mmm."`,
            cost: 77777,
            requirements: [
                1000
            ],
            effect: function (value, user) {
                return value + Math.floor(user.getMMM() / 1000);
            }
        }
    ],
}

module.exports = {
    Upgrades: class Upgrades {
        constructor(upgrade, category) {
            Object.assign(this, upgrade);
            this.category = category;
        }

        getId = () => this.id;
        getName = () => this.name;
        getDescription = () => this.description;
        getCost = () => this.cost;
        getEffect = () => this.effect;
        getEtc = () => {
            const etc = {};

            for (const key in this) {
                if (['id', 'name', 'description', 'cost', 'requirements', 'effect', 'category', 'onEquip'].includes(key)) continue;

                etc[key] = this[key];
            }

            return etc;
        }

        activateOnEquip(user) {
            if (!this.onEquip) return;

            this.onEquip(user);
        }

        buy(user) {
            const cost = this.getCost();
            const mmms = user.getMMM();

            if (mmms < cost) return false;
            const userUpgrades = user.getUpgrades();

            if (userUpgrades.find(upgrade => upgrade.id === this.getId())) return false;

            user.setMMM(mmms - cost);
            const etc = this.getEtc();

            user.addUpgrade({ id: this.getId(), extra: etc });
            if (this.onEquip) this.onEquip(user);

            return this;
        }

        static getUpgrade(id) {
            for (const category in upgrades) {
                const upgrade = upgrades[category].find(upgrade => upgrade.id === id);

                if (upgrade) return new Upgrades(upgrade, category);
            }
        }

        static getUpgrades() {
            return upgrades;
        }
    }
}