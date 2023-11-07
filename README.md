# mmm counter
"Tiny" joke bot I made for a discord server. A bot that counts how many times someone says "mmm" in the text channels.

Uses discord.js.

## Download
1. Clone the repository
2. run `npm install`
3. (optional) Create a `.env` file and add your bot token to it. (see `.env.example`)
4. (optional) start the bot with `npm run dev` or `node src/index.js`

## npm scripts
- `npm run dev` - the same as `node src/index.js`
- `npm run slashcommands` - registers the slash commands. (only works if you have a `.env` file with a bot token and a bot client id)
