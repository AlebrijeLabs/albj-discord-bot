// Express server initialization (express.js)
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app for health checks - COMPLETELY INDEPENDENT OF DISCORD
const app = express();
const PORT = process.env.PORT || 3000;

// Start the Express server IMMEDIATELY - before anything else
console.log('🌐 Starting Express server for health checks...');

// Enhanced health check endpoint with more detailed status
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    discordStatus: global.discordStatus || 'initializing'
  });
  console.log('Health check responded with status 200');
});

// Root path for basic connectivity testing
app.get('/', (req, res) => {
  res.status(200).send('ALBJ Discord Bot is online');
});

// Start the health check server FIRST
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Health check server running on port ${PORT}`);
});

// Only AFTER Express server is running, initialize Discord client
console.log('🤖 Initializing Discord bot (health check server already running)...');

// Set initial Discord status
global.discordStatus = 'initializing';

// Now load Discord.js and other components
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const cron = require('node-cron');
const axios = require('axios');
const config = require('./config');
const { alebrijeSpirits, getRandomSpirit, getSpiritByName } = require('./spirits');
const { dailyUpdateTemplates, generateDailyUpdate } = require('./daily-updates');

// Import command modules
const { 
    handleStart, 
    handleHello, 
    handleFunFact, 
    handleHolders, 
    handleLaunch, 
    handleTokenomics, 
    handleCulture, 
    handleTeam, 
    handleCareers, 
    handleEvents, 
    handleSocial, 
    handleSupport, 
    handleFAQ, 
    handlePriceAlert 
} = require('./commands/additional_commands');

const { 
    handleCheckIn, 
    handleMyStats, 
    handleNotifications 
} = require('./commands/engagement');

// Create Discord client with error handling
let client;
try {
    // Create Discord client with ALL intents (privileged intents enabled)
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,        // PRIVILEGED - Now enabled!
            GatewayIntentBits.GuildMembers,          // PRIVILEGED - Now enabled!
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences         // PRIVILEGED - Now enabled!
        ]
    });
    
    // Collections for commands and cooldowns
    client.commands = new Collection();
    const cooldowns = new Collection();
    
    console.log('✅ Discord client initialized successfully');
} catch (error) {
    console.error('❌ Error initializing Discord client:', error);
    global.discordStatus = 'failed to initialize';
    // Continue running for health checks even if Discord fails
}

// Add interaction handler right after client initialization
if (client) {
    // Handle all interaction types (slash commands, buttons, etc.)
    client.on('interactionCreate', async interaction => {
        console.log(`Received interaction: ${interaction.commandName || interaction.customId || 'unknown'}`);
        
        try {
            // IMMEDIATELY acknowledge the interaction to prevent timeout
            if (interaction.isCommand() || interaction.isButton()) {
                await interaction.deferReply().catch(console.error);
                console.log('Interaction deferred successfully');
            }
            
            // Handle different interaction types
            if (interaction.isCommand()) {
                // Handle slash commands
                const { commandName } = interaction;
                console.log(`Processing slash command: ${commandName}`);
                
                // Simple help command response
                if (commandName === 'help') {
                    const helpEmbed = new EmbedBuilder()
                        .setTitle('ALBJ Bot Commands')
                        .setDescription('Here are the available commands:')
                        .addFields(
                            { name: '/help', value: 'Show this help message' },
                            { name: '/info', value: 'Get information about ALBJ token' },
                            { name: '/spirits', value: 'View the Alebrije spirits' }
                        )
                        .setColor('#00ff88');
                    
                    await interaction.editReply({ embeds: [helpEmbed] });
                } 
                // Basic info command
                else if (commandName === 'info') {
                    const infoEmbed = new EmbedBuilder()
                        .setTitle('ALBJ Token Information')
                        .setDescription('ALBJ is a blockchain-powered community celebrating Alebrije spirits.')
                        .setColor('#ff6600');
                    
                    await interaction.editReply({ embeds: [infoEmbed] });
                }
                // Simple test command
                else if (commandName === 'test') {
                    await interaction.editReply('Bot is working! 🎉');
                }
                // Spirits command
                else if (commandName === 'spirits') {
                    const spiritEmbed = new EmbedBuilder()
                        .setTitle('Alebrije Spirits')
                        .setDescription('Alebrijes are brightly colored Mexican folk art sculptures of fantastical creatures.')
                        .addFields(
                            { name: 'Dragon', value: 'Represents strength and power' },
                            { name: 'Jaguar', value: 'Represents agility and stealth' },
                            { name: 'Eagle', value: 'Represents vision and freedom' },
                            { name: 'Serpent', value: 'Represents wisdom and transformation' }
                        )
                        .setColor('#ff00aa')
                        .setFooter({ text: 'ALBJ - Connecting communities through culture' });
                    
                    await interaction.editReply({ embeds: [spiritEmbed] });
                }
                // Unknown command
                else {
                    await interaction.editReply({ content: `Command ${commandName} is still under development. Try /help for available commands.` });
                }
            } 
            else if (interaction.isButton()) {
                // Handle button interactions
                const { customId } = interaction;
                console.log(`Processing button interaction: ${customId}`);
                
                await interaction.editReply({ content: `Button ${customId} clicked! This feature is coming soon.` });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            
            // Try to respond with an error message
            try {
                const errorMessage = 'An error occurred while processing your command. Please try again later.';
                
                if (interaction.deferred) {
                    await interaction.editReply({ content: errorMessage }).catch(console.error);
                } else if (!interaction.replied) {
                    await interaction.reply({ content: errorMessage, ephemeral: true }).catch(console.error);
                }
            } catch (followUpError) {
                console.error('Error sending error response:', followUpError);
            }
        }
    });
}

// Deploy slash commands function
async function deployCommands() {
    try {
        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v9');
        
        console.log('Deploying slash commands...');
        
        // Basic set of commands
        const commands = [
            {
                name: 'help',
                description: 'Get help with ALBJ Bot commands',
            },
            {
                name: 'info',
                description: 'Learn about the ALBJ token',
            },
            {
                name: 'test',
                description: 'Test if the bot is working',
            },
            {
                name: 'spirits',
                description: 'Learn about Alebrije spirits',
            }
        ];
        
        const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN || process.env.DISCORD_TOKEN);
        
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

// Function to start daily updates scheduler
function startDailyUpdates() {
    // Example scheduled task - runs every day at 12:00 PM
    cron.schedule('0 12 * * *', async () => {
        try {
            console.log('Running daily update task...');
            // Your daily update code here
        } catch (error) {
            console.error('Error in daily update task:', error);
        }
    });
}

// Connect to Discord with error handling
try {
    if (client) {
        // Bot ready event
        client.once('ready', async () => {
            console.log('🎭 ✅ ALBJ Discord Bot is ONLINE!');
            console.log(`🤖 Logged in as: ${client.user.tag}`);
            console.log('🔗 Bot is ready to serve the ALBJ community!');
            
            global.discordStatus = 'online';
            
            // Set bot status
            client.user.setActivity('🐉 ALBJ Token Launch: June 12, 2025', { type: 'WATCHING' });
            
            try {
                // Deploy slash commands
                await deployCommands();
                
                // Start daily updates scheduler
                startDailyUpdates();
                
                console.log('🌟 Daily updates scheduler started!');
            } catch (err) {
                console.error('Error in initialization tasks:', err);
                // Continue running even if these fail
            }
        });

        // Error event handler
        client.on('error', (error) => {
            console.error('Discord client error:', error);
            global.discordStatus = 'error';
        });

        // Login with error handling
        console.log('Attempting to log in to Discord...');
        client.login(process.env.BOT_TOKEN || process.env.DISCORD_TOKEN).catch(err => {
            console.error('Failed to login to Discord:', err);
            global.discordStatus = 'login failed';
            // Keep server running for health checks
        });
    }
} catch (error) {
    console.error('Error connecting to Discord:', error);
    global.discordStatus = 'connection error';
    // Keep server running for health checks
}

// The rest of your code...

// Rest of your bot.js file goes here...

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down ALBJ Discord Bot...');
    if (client) client.destroy();
    server.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down ALBJ Discord Bot...');
    if (client) client.destroy();
    server.close();
    process.exit(0);
});

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    global.discordStatus = 'error: uncaught exception';
    // Keep running for health checks
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    global.discordStatus = 'error: unhandled rejection';
    // Keep running for health checks
});

console.log('🎭 ALBJ Discord Bot initialization complete!');

// Make Express app available for module exports
module.exports = { app, client }; 