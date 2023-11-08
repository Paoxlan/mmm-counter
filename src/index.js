// Node Requires //
const fs = require('fs');
const path = require('path');

// Requires //
require('dotenv').config();
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { MMM } = require('./modules/mmm.js');

const { Upgrades } = require('./modules/upgrades.js');
const { Users } = require('./modules/users.js');

// Client //
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ]
});

// Commands //
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Data //
const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

// Events //
client.on(Events.ClientReady, function () {
    console.log(`Bot is ready!`);
});

client.on(Events.InteractionCreate, async function (interaction) {
    if (!interaction.isChatInputCommand()) return;
	const fileName = `${interaction.commandName}.js`;
	const filePath = path.join(commandsPath, fileName);

	const command = require(filePath);
	command.execute(interaction);
});

client.on(Events.MessageCreate, async function (message) {
	if (message.author.bot) return;
    if (!MMM.isMMM(message)) return;
    
    MMM.updateUser(message);
});

// Login //
client.login(process.env.TOKEN);

// Run onequip functions //
(async function () {
    const users = Users.getUsers();

    for (const user of users) {
        const userObject = Users.getUser(user.user_id);
        for (const userUpgrade of userObject.getUpgrades()) {
            const extra = userUpgrade.extra;
            if (!extra) continue;

            if (extra.hasOnEquip) {
                const upgrade = Upgrades.getUpgrade(userUpgrade.id);
                upgrade.activateOnEquip(userObject);
            }
        }
    }
})();