const { Client, GatewayIntentBits } = require("discord.js");
require('dotenv').config(); // To load .env file for local testing

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    console.error("ERROR: DISCORD_BOT_TOKEN not found in environment variables. Please set it in your .env file for local testing.");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.once("ready", () => { console.log("SUCCESS WITH ALL INTENTS:", client.user.tag); process.exit(0); });
client.on("error", (err) => { console.log("ERROR:", err.message); process.exit(1); });
client.login(token).catch((err) => { console.log("LOGIN FAILED:", err.message); process.exit(1); });
