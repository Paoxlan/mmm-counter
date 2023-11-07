// Requires //
require('dotenv').config();
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Client //
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Args //
const args = process.argv.slice(2);
const channelId = args[0];
const message = args[1];

// Events //
client.on(Events.ClientReady, function () {
    const channel = client.channels.cache.get(channelId);
    channel.send(message);

    client.destroy();
});

client.login(process.env.TOKEN);