const { Client, GatewayIntentBits } = require("discord.js");
require('dotenv').config(); // To load .env file for local testing

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    console.error("ERROR: DISCORD_BOT_TOKEN not found in environment variables. Please set it in your .env file for local testing.");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once("ready", () => { console.log("SUCCESS:", client.user.tag); process.exit(0); });
client.on("error", () => { console.log("ERROR"); process.exit(1); });
client.login(token).catch(() => { console.log("INVALID TOKEN OR LOGIN FAILED"); process.exit(1); });
