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
                const { commandName } = interaction;
                console.log(`Processing slash command: ${commandName}`);

                // Basic commands
                if (commandName === 'help') {
                    const helpEmbed = new EmbedBuilder()
                        .setTitle('🎭✨ ALBJ Bot Commands ✨🎭')
                        .setDescription('Here are all the magical commands I can perform!')
                        .addFields(
                            { name: '📊 Basic Commands', value: '`/help` `/info` `/countdown`', inline: false },
                            { name: '🐉 Alebrije Spirits', value: '`/spirits` `/alebrije`', inline: false },
                            { name: '💰 Token & Market', value: '`/price` `/holders` `/tokenomics`', inline: false },
                            { name: '🌍 Community', value: '`/roadmap` `/community` `/social` `/team` `/partnerships`', inline: false },
                            { name: '🎨 NFT & Gaming', value: '`/nft` `/staking` `/events`', inline: false },
                            { name: '🎭 Fun Commands', value: '`/quiz` `/joke` `/quote` `/meme` `/funfact` `/daily`', inline: false },
                            { name: '⚙️ Admin Commands', value: '`/setup` `/announce`', inline: false }
                        )
                        .setColor('#00ff88')
                        .setFooter({ text: 'ALBJ Token - Bridging folklore with DeFi' });
                    
                    await interaction.editReply({ embeds: [helpEmbed] });
                }
                else if (commandName === 'info') {
                    const infoEmbed = new EmbedBuilder()
                        .setTitle('ALBJ Token Information')
                        .setDescription('ALBJ is a blockchain-powered community celebrating Alebrije spirits.')
                        .addFields(
                            { name: 'About ALBJ', value: 'ALBJ token connects the vibrant world of Mexican Alebrije art with modern blockchain technology.' },
                            { name: 'Use Cases', value: '• Community governance\n• NFT collecting\n• Access to exclusive events\n• Staking rewards' },
                            { name: 'Launch Date', value: 'June 12, 2025' }
                        )
                        .setColor('#ff6600');
                    
                    await interaction.editReply({ embeds: [infoEmbed] });
                }
                else if (commandName === 'countdown') {
                    // Set the ALBJ token launch date
                    const launchDate = new Date('June 12, 2025 12:00:00 UTC');
                    const currentDate = new Date();
                    
                    // Calculate time difference
                    const timeDiff = launchDate - currentDate;
                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    
                    const countdownEmbed = new EmbedBuilder()
                        .setTitle('🚀 ALBJ Token Launch Countdown')
                        .setDescription(`**${days} days, ${hours} hours, ${minutes} minutes**`)
                        .addFields(
                            { name: 'Launch Date', value: 'June 12, 2025' },
                            { name: 'Get Ready!', value: 'Join our community to prepare for the launch!' }
                        )
                        .setColor('#FFA500')
                        .setFooter({ text: 'ALBJ - The future of Alebrije spirits on the blockchain' });
                    
                    await interaction.editReply({ embeds: [countdownEmbed] });
                }
                // Spirit command handlers
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
                else if (commandName === 'alebrije') {
                    const spiritEmbed = new EmbedBuilder()
                        .setTitle('Featured Alebrije: The Guardian Dragon')
                        .setDescription('The Guardian Dragon is one of the most powerful Alebrije spirits.')
                        .addFields(
                            { name: 'Element', value: 'Fire' },
                            { name: 'Traits', value: 'Strength, Protection, Wisdom' },
                            { name: 'Origin', value: 'Ancient Mesoamerican mythology' }
                        )
                        .setColor('#ff5500');
                    
                    await interaction.editReply({ embeds: [spiritEmbed] });
                }
                
                // Token & Market commands
                else if (commandName === 'price') {
                    const priceEmbed = new EmbedBuilder()
                        .setTitle('ALBJ Token Price')
                        .setDescription('Current market data for ALBJ token')
                        .addFields(
                            { name: 'Current Price', value: '$0.075 USD' },
                            { name: '24h Change', value: '+5.2%' },
                            { name: 'Market Cap', value: '$7,500,000' },
                            { name: 'Volume (24h)', value: '$1,250,000' }
                        )
                        .setColor('#00ff88');
                    
                    await interaction.editReply({ embeds: [priceEmbed] });
                }
                else if (commandName === 'holders') {
                    const holdersEmbed = new EmbedBuilder()
                        .setTitle('ALBJ Token Holders')
                        .setDescription('Current holder statistics for ALBJ token')
                        .addFields(
                            { name: 'Total Holders', value: '12,500+' },
                            { name: 'Average Holding', value: '8,000 ALBJ' },
                            { name: 'Holder Distribution', value: '85% Community, 15% Team & Partners' }
                        )
                        .setColor('#00ff88');
                    
                    await interaction.editReply({ embeds: [holdersEmbed] });
                }
                else if (commandName === 'tokenomics') {
                    const tokenomicsEmbed = new EmbedBuilder()
                        .setTitle('ALBJ Tokenomics')
                        .setDescription('ALBJ token distribution and economics')
                        .addFields(
                            { name: 'Total Supply', value: '100,000,000 ALBJ' },
                            { name: 'Circulating Supply', value: '42,500,000 ALBJ' },
                            { name: 'Distribution', value: '40% Public Sale\n20% Community Rewards\n15% Team\n15% Marketing\n10% Development' }
                        )
                        .setColor('#00ff88');
                    
                    await interaction.editReply({ embeds: [tokenomicsEmbed] });
                }
                
                // Handle other commands with a template response for now
                else {
                    // Generic response for other commands
                    const commandGroups = {
                        roadmap: 'Community',
                        community: 'Community',
                        social: 'Community',
                        team: 'Community',
                        partnerships: 'Community',
                        nft: 'NFT & Gaming',
                        staking: 'NFT & Gaming',
                        events: 'NFT & Gaming',
                        quiz: 'Fun Commands',
                        joke: 'Fun Commands',
                        quote: 'Fun Commands',
                        meme: 'Fun Commands',
                        funfact: 'Fun Commands',
                        daily: 'Fun Commands',
                        setup: 'Admin Commands',
                        announce: 'Admin Commands'
                    };
                    
                    const group = commandGroups[commandName] || 'Other';
                    
                    const genericEmbed = new EmbedBuilder()
                        .setTitle(`${commandName.charAt(0).toUpperCase() + commandName.slice(1)} Command`)
                        .setDescription(`This command is available but full functionality is coming soon!`)
                        .addFields(
                            { name: 'Category', value: group },
                            { name: 'Status', value: 'Coming soon' }
                        )
                        .setColor('#FFA500')
                        .setFooter({ text: 'ALBJ - More features coming soon!' });
                    
                    await interaction.editReply({ embeds: [genericEmbed] });
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
        
        // Restore ALL original commands
        const commands = [
            // Basic Commands
            {
                name: 'help',
                description: 'Get help with ALBJ Bot commands',
            },
            {
                name: 'info',
                description: 'Learn about the ALBJ token',
            },
            {
                name: 'countdown',
                description: 'See the countdown to ALBJ token launch',
            },
            
            // Alebrije Spirits
            {
                name: 'spirits',
                description: 'Learn about Alebrije spirits',
            },
            {
                name: 'alebrije',
                description: 'Get information about a specific Alebrije spirit',
            },
            
            // Token & Market
            {
                name: 'price',
                description: 'Check the current price of ALBJ token',
            },
            {
                name: 'holders',
                description: 'See statistics about ALBJ token holders',
            },
            {
                name: 'tokenomics',
                description: 'Learn about ALBJ token distribution and economics',
            },
            
            // Community
            {
                name: 'roadmap',
                description: 'View the ALBJ project roadmap',
            },
            {
                name: 'community',
                description: 'Get information about the ALBJ community',
            },
            {
                name: 'social',
                description: 'Get links to ALBJ social media channels',
            },
            {
                name: 'team',
                description: 'Learn about the ALBJ team members',
            },
            {
                name: 'partnerships',
                description: 'View ALBJ partnerships and collaborations',
            },
            
            // NFT & Gaming
            {
                name: 'nft',
                description: 'Get information about ALBJ NFT collections',
            },
            {
                name: 'staking',
                description: 'Learn about ALBJ token staking options',
            },
            {
                name: 'events',
                description: 'View upcoming ALBJ events and activities',
            },
            
            // Fun Commands
            {
                name: 'quiz',
                description: 'Take a quiz about Alebrijes and earn rewards',
            },
            {
                name: 'joke',
                description: 'Get a random joke from the Alebrije Bot',
            },
            {
                name: 'quote',
                description: 'Receive an inspirational quote',
            },
            {
                name: 'meme',
                description: 'Get a random Alebrije meme',
            },
            {
                name: 'funfact',
                description: 'Learn a fun fact about Alebrijes or crypto',
            },
            {
                name: 'daily',
                description: 'Get your daily Alebrije update',
            },
            
            // Admin Commands
            {
                name: 'setup',
                description: 'Set up the ALBJ bot for your server (Admin only)',
            },
            {
                name: 'announce',
                description: 'Create an announcement (Admin only)',
            }
        ];
        
        const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN || process.env.DISCORD_TOKEN);
        
        console.log('Started refreshing application (/) commands.');
        
        // Handle BigInt serialization issue - convert to string if needed
        let applicationId = client.user.id;
        // Check if it's a BigInt and convert to string if necessary
        if (typeof applicationId === 'bigint' || (typeof applicationId === 'object' && applicationId !== null)) {
            applicationId = String(applicationId);
        }
        
        console.log(`Deploying ${commands.length} commands to application ID: ${applicationId}`);
        
        await rest.put(
            Routes.applicationCommands(applicationId),
            { body: commands },
        );
        
        console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
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
        // Improved token handling
        const discordToken = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
        
        if (!discordToken) {
            console.error('❌ ERROR: No Discord token found! Please set BOT_TOKEN or DISCORD_TOKEN environment variable.');
            global.discordStatus = 'missing token';
        } else {
            console.log(`Token detected: Using ${process.env.BOT_TOKEN ? 'BOT_TOKEN' : 'DISCORD_TOKEN'} (${discordToken.substring(0, 5)}...)`);
            
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
            client.login(discordToken).catch(err => {
                console.error('Failed to login to Discord:', err);
                global.discordStatus = 'login failed';
                // Keep server running for health checks
            });
        }
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