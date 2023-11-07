# mmm counter
"Tiny" joke bot I made for a discord server. A bot that counts how many times someone says "mmm" in the text channels, and it supports slash commands.

This bot uses discord.js.

## What it does
- Sending a message with "mmm" included will increase your mmm count by 1.
- You can purchase upgrades with the `/shop` command to boost your productivity.
- mmm coins are earned by the same way as mmm count, but you can also get them passively from upgrades.

## Invite
- [The Discord bot](https://discord.com/api/oauth2/authorize?client_id=1161609471307558933&permissions=67584&scope=bot)

---

## Download
1. Clone the repository
2. run `npm install`
3. (optional) Create a `.env` file and add your bot token to it. (see `.env.example`)
4. (optional) start the bot with `npm run dev` or `node src/index.js`

## npm scripts
- `npm run dev` - the same as `node src/index.js`
- `npm run slashcommands` - registers the slash commands. (only works if you have a `.env` file with a bot token and a bot client id)