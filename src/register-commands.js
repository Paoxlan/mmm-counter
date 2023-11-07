// Node Requires //
const fs = require('fs');
const path = require('path');

// Requires //
require('dotenv').config();
const { REST, Routes } = require('discord.js');

// REST //
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Commands //
const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

// Register commands //
(async function() {
    try {
        console.log('Registering slash commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )

        console.log('Slash commands were registered successfully.');
    } catch (error) {
        console.log(`An error occurred while registering slash commands: ${error}`);
    }
})();