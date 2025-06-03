const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const cron = require('node-cron');
const axios = require('axios');
const config = require('./config');
const { alebrijeSpirits, getRandomSpirit, getSpiritByName } = require('./spirits');
const { dailyUpdateTemplates, generateDailyUpdate } = require('./daily-updates');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');

// Import new command modules
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

// Load environment variables
dotenv.config();

// Create Discord client with ALL intents (privileged intents enabled)
const client = new Client({
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

// Create Express app for health checks - MOVED OUTSIDE READY EVENT
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint - MOVED OUTSIDE READY EVENT
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start the health check server - MOVED OUTSIDE READY EVENT
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});

console.log('🤖 ALBJ Discord Bot is starting...');

// =====================================
// UTILITY FUNCTIONS
// =====================================

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function calculateDaysUntilLaunch() {
    const launchDate = new Date('2025-06-12T00:00:00Z');
    const now = new Date();
    const timeDiff = launchDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function createEmbed(title, description, color = '#00ff88') {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'ALBJ Token - Powered by Alebrije Spirits', iconURL: config.ALBJ_LOGO_URL });
}

function createSpiritEmbed(spirit) {
    const embed = new EmbedBuilder()
        .setTitle(`🎭 ${spirit.name}`)
        .setDescription(spirit.description)
        .setColor(spirit.color)
        .addFields(
            { name: '🌟 Powers', value: spirit.powers.join('\n'), inline: true },
            { name: '🎯 Personality', value: spirit.personality, inline: true },
            { name: '💎 Rarity', value: spirit.rarity, inline: true },
            { name: '🎨 Elements', value: spirit.elements.join(' + '), inline: true }
        )
        .setImage(spirit.imageUrl)
        .setTimestamp()
        .setFooter({ text: 'ALBJ Token - Alebrije Spirits Collection', iconURL: config.ALBJ_LOGO_URL });
    
    return embed;
}

// =====================================
// BOT EVENTS
// =====================================

client.once('ready', async () => {
    console.log('🎭 ✅ ALBJ Discord Bot is ONLINE!');
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    console.log('🔗 Bot is ready to serve the ALBJ community!');
    
    // Set bot status
    client.user.setActivity('🐉 ALBJ Token Launch: June 12, 2025', { type: 'WATCHING' });
    
    // Deploy slash commands
    await deployCommands();
    
    // Start daily updates scheduler
    startDailyUpdates();
    
    console.log('🌟 Daily updates scheduler started!');
});

// Welcome new members
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome' || ch.name === 'general');
    if (!welcomeChannel) return;

    const spirit = getRandomSpirit();
    const welcomeEmbed = createEmbed(
        `🎭 Welcome to ALBJ Token, ${member.displayName}!`,
        `${config.WELCOME_MESSAGE}\n\n🐉 **Your Welcome Spirit:** ${spirit.name}\n${spirit.greeting}`,
        '#ff6600'
    );

    const welcomeButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('get_started')
                .setLabel('🚀 Get Started')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('view_spirits')
                .setLabel('🎨 View Spirits')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel('🌐 Website')
                .setURL(config.ALBJ_WEBSITE_URL)
                .setStyle(ButtonStyle.Link)
        );

    await welcomeChannel.send({ 
        content: `${member}`, 
        embeds: [welcomeEmbed], 
        components: [welcomeButtons] 
    });

    // Try to DM the new member
    try {
        const dmEmbed = createEmbed(
            '🎭 Welcome to ALBJ Token!',
            `Thank you for joining our community!\n\nHere are some quick commands to get started:\n• \`/help\` - See all commands\n• \`/spirits\` - Meet the Alebrije spirits\n• \`/info\` - Learn about ALBJ token\n\nFeel free to ask questions in the server!`,
            '#00ff88'
        );
        await member.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.log('Could not DM new member (DMs closed)');
    }
});

// Handle slash commands and button interactions
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    }
});

// Handle message commands (legacy support)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Handle prefix commands for backward compatibility
    const prefix = '!';
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Route to appropriate handler
        await handlePrefixCommand(message, commandName, args);
    }
});

// =====================================
// SLASH COMMAND HANDLERS
// =====================================

async function handleSlashCommand(interaction) {
    const { commandName, options } = interaction;

    await interaction.deferReply();

    try {
        switch (commandName) {
            case 'help':
                await handleHelp(interaction);
                break;
            case 'info':
                await handleTokenInfo(interaction);
                break;
            case 'spirits':
                await handleSpirits(interaction);
                break;
            case 'alebrije':
                const spiritName = options.getString('name');
                await handleAlebrije(interaction, spiritName);
                break;
            case 'countdown':
                await handleCountdown(interaction);
                break;
            case 'price':
                await handlePrice(interaction);
                break;
            case 'roadmap':
                await handleRoadmap(interaction);
                break;
            case 'community':
                await handleCommunity(interaction);
                break;
            case 'nft':
                await handleNFT(interaction);
                break;
            case 'quiz':
                await handleQuiz(interaction);
                break;
            case 'joke':
                await handleJoke(interaction);
                break;
            case 'quote':
                await handleQuote(interaction);
                break;
            case 'meme':
                await handleMeme(interaction);
                break;
            case 'daily':
                await handleDailyUpdate(interaction);
                break;
            case 'setup':
                await handleSetup(interaction);
                break;
            case 'announce':
                await handleAnnouncement(interaction);
                break;
            case 'start':
                await handleStart(interaction);
                break;
            case 'hello':
                await handleHello(interaction);
                break;
            case 'funfact':
                await handleFunFact(interaction);
                break;
            case 'holders':
                await handleHolders(interaction);
                break;
            case 'launch':
                await handleLaunch(interaction);
                break;
            case 'tokenomics':
                await handleTokenomics(interaction);
                break;
            case 'culture':
                await handleCulture(interaction);
                break;
            case 'team':
                await handleTeam(interaction);
                break;
            case 'careers':
                await handleCareers(interaction);
                break;
            case 'events':
                await handleEvents(interaction);
                break;
            case 'social':
                await handleSocial(interaction);
                break;
            case 'support':
                await handleSupport(interaction);
                break;
            case 'faq':
                await handleFAQ(interaction);
                break;
            case 'pricealert':
                await handlePriceAlert(interaction);
                break;
            case 'checkin':
                await handleCheckIn(interaction);
                break;
            case 'mystats':
                await handleMyStats(interaction);
                break;
            case 'notifications':
            case 'alerts':
                await handleNotifications(interaction);
                break;
            default:
                await interaction.editReply({ content: 'Command not found! Use `/help` to see available commands.', ephemeral: true });
        }
    } catch (error) {
        console.error('Error handling slash command:', error);
        const errorMessage = 'An error occurred while processing your command. Please try again later.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}

async function handleHelp(interaction) {
    const helpEmbed = new EmbedBuilder()
        .setTitle('🤖 ALBJ Token Bot Commands 🤖')
        .setDescription('🌈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌈')
        .setColor('#00ff88')
        .addFields(
            { name: '📊 BASIC COMMANDS', value: '• /start - Welcome & main menu\n• /help - Show this help menu\n• /hello - Interactive greeting\n• /funfact - Random ALBJ fact' },
            { name: '💰 TOKEN INFORMATION', value: '• /info - Complete token details\n• /price - Price check (post-launch)\n• /holders - Holder statistics\n• /roadmap - Development roadmap\n• /countdown - Launch countdown\n• /launch - Launch day information\n• /tokenomics - Token distribution' },
            { name: '🎨 NFT & SPIRITS', value: '• /nft - NFT collection preview\n• /spirits - View all 12 Alebrije creatures\n• /alebrije name - Individual spirit info\n• /culture - Mexican folklore background' },
            { name: '👥 COMMUNITY', value: '• /community - Community links\n• /team - Meet the team\n• /careers - Job opportunities\n• /events - Upcoming events\n• /social - Social media links' },
            { name: '🆘 SUPPORT', value: '• /support - Help & support center\n• /faq - Frequently asked questions' },
            { name: '🎭 FUN & GAMES', value: '• /quote - Inspirational quotes\n• /joke - ALBJ themed jokes\n• /meme - Community memes\n• /quiz - Test your knowledge' },
            { name: '🏆 ENGAGEMENT (NEW!)', value: '• /checkin - Daily spirit check-in\n• /mystats - View your progress' },
            { name: '🔔 NOTIFICATIONS (NEW!)', value: '• /notifications - Manage alert preferences\n• /alerts - Same as /notifications' },
            { name: '🛠️ TOOLS', value: '• /pricealert - Price monitoring (post-launch)' },
        )
        .setFooter({ text: '💡 Tip: Use the interactive buttons for easier navigation!\n🔗 Website: https://albj.io | 🎮 Discord: https://discord.gg/vrBnKB68 | 🐦 Twitter: https://twitter.com/ALBJToken' });

    await interaction.editReply({ embeds: [helpEmbed], ephemeral: true });
}

async function handleTokenInfo(interaction) {
    const daysUntilLaunch = calculateDaysUntilLaunch();
    
    const infoEmbed = new EmbedBuilder()
        .setTitle('🎭💎 ALBJ Token Information 💎🎭')
        .setDescription('🔥━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🔥')
        .setColor('#ff6600')
        .addFields(
            {
                name: '📋 Basic Details',
                value: '**Name:** ALBJ Token 🏷️\n**Symbol:** ALBJ 🎯\n**Blockchain:** Solana ⚡\n**Total Supply:** 9,000,000,000 ALBJ 💰\n**Launch Date:** June 12, 2025 📅',
                inline: true
            },
            {
                name: '💸 Token Distribution',
                value: '🔥 Burn at Launch: 50% (4.5B)\n🎁 Community Airdrops: 10%\n💧 Liquidity Pool: 20%\n📈 Marketing & Growth: 10%\n🛠️ Ecosystem Development: 5%\n👥 Founders & Advisors: 5%',
                inline: true
            },
            {
                name: '⚙️ Transaction Mechanics',
                value: '• Max Wallet: 2% of supply 📊\n• Buy/Sell Tax: 5% total 💳\n• Anti-bot protection enabled 🛡️',
                inline: false
            },
            {
                name: '✨ Special Features',
                value: '🐉 12 Alebrije Spirit Creatures\n🎨 Cultural folklore inspiration\n🌆 Cyberpunk aesthetic\n👥 Community-driven ecosystem',
                inline: false
            },
            {
                name: '⏰ Launch Countdown',
                value: `**${daysUntilLaunch} days remaining!**`,
                inline: false
            }
        )
        .setThumbnail(config.ALBJ_LOGO_URL)
        .setFooter({ text: 'ALBJ Token - Bridging Folklore and DeFi', iconURL: config.ALBJ_LOGO_URL })
        .setTimestamp();

    const infoButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('🌐 Website')
                .setURL(config.ALBJ_WEBSITE_URL)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('📄 Whitepaper')
                .setURL(`${config.ALBJ_WEBSITE_URL}/whitepaper.pdf`)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setCustomId('roadmap')
                .setLabel('🗺️ Roadmap')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ embeds: [infoEmbed], components: [infoButtons] });
}

async function handleSpirits(interaction) {
    const spiritsEmbed = new EmbedBuilder()
        .setTitle('🎭 The 12 Alebrije Spirits of ALBJ 🎭')
        .setDescription('Discover the magical creatures that power our ecosystem!')
        .setColor('#9932cc')
        .addFields(
            {
                name: '🔥 Fire Spirits',
                value: '🐉 Dragon-Jaguar\n🦅 Eagle-Lizard\n🐴 Horse-Phoenix',
                inline: true
            },
            {
                name: '💧 Water Spirits',
                value: '🐺 Wolf-Fish\n🦀 Crab-Dragonfly\n🐸 Frog-Hummingbird',
                inline: true
            },
            {
                name: '🌬️ Air Spirits',
                value: '🦉 Owl-Serpent\n🦋 Fox-Butterfly\n🐦 Snake-Quetzal',
                inline: true
            },
            {
                name: '🌍 Earth Spirits',
                value: '🐢 Turtle-Bat\n🐱 Cat-Chameleon\n🐑 Sheep-Coyote',
                inline: false
            }
        )
        .setImage('https://albj.io/images/spirits-collection.png')
        .setFooter({ text: 'Use /alebrije [name] to learn about individual spirits', iconURL: config.ALBJ_LOGO_URL })
        .setTimestamp();

    const spiritsButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('random_spirit')
                .setLabel('🎲 Random Spirit')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('nft_info')
                .setLabel('🎨 NFT Collection')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel('🌐 Gallery')
                .setURL(`${config.ALBJ_WEBSITE_URL}/spirits`)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [spiritsEmbed], components: [spiritsButtons] });
}

// =====================================
// DAILY UPDATES SYSTEM
// =====================================

function startDailyUpdates() {
    // Schedule daily updates at 9:00 AM UTC
    cron.schedule('0 9 * * *', async () => {
        console.log('🌅 Running daily update...');
        await sendDailyUpdates();
    }, {
        timezone: 'UTC'
    });

    // Additional update at 6:00 PM UTC for different time zones
    cron.schedule('0 18 * * *', async () => {
        console.log('🌆 Running evening update...');
        await sendEveningUpdate();
    }, {
        timezone: 'UTC'
    });
}

async function sendDailyUpdates() {
    const guilds = client.guilds.cache;
    
    for (const guild of guilds.values()) {
        try {
            // Find announcement channel
            const announcementChannel = guild.channels.cache.find(
                ch => ch.name.includes('announcement') || ch.name.includes('daily') || ch.name === 'general'
            );
            
            if (announcementChannel && announcementChannel.type === ChannelType.GuildText) {
                const dailyUpdate = generateDailyUpdate();
                const spirit = getRandomSpirit();
                
                const updateEmbed = createEmbed(
                    `🌅 ${dailyUpdate.title}`,
                    `${dailyUpdate.content}\n\n**Today's Featured Spirit:** ${spirit.name}\n${spirit.dailyMessage}`,
                    '#ff6600'
                );
                
                updateEmbed.setImage(spirit.imageUrl);
                
                const updateButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('spirit_details')
                            .setLabel(`🎭 About ${spirit.name}`)
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('daily_quiz')
                            .setLabel('🎯 Daily Quiz')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setLabel('🌐 Website')
                            .setURL(config.ALBJ_WEBSITE_URL)
                            .setStyle(ButtonStyle.Link)
                    );
                
                await announcementChannel.send({ embeds: [updateEmbed], components: [updateButtons] });
                
                // Cross-platform notification to Telegram
                await sendCrossPlatformUpdate(dailyUpdate, spirit);
            }
        } catch (error) {
            console.error(`Error sending daily update to guild ${guild.name}:`, error);
        }
    }
}

async function sendCrossPlatformUpdate(dailyUpdate, spirit) {
    // Send update to Telegram bot
    try {
        const telegramMessage = `🔄 **Cross-Platform Update from Discord**\n\n${dailyUpdate.title}\n\n${dailyUpdate.content}\n\n**Featured Spirit:** ${spirit.name}`;
        
        // This would integrate with the Telegram bot
        // For now, we'll log it
        console.log('📱 Cross-platform update ready:', telegramMessage);
        
        // In production, you would send this to your Telegram channels
        // await telegramBot.sendMessage(TELEGRAM_CHANNEL_ID, telegramMessage);
        
    } catch (error) {
        console.error('Error sending cross-platform update:', error);
    }
}

// =====================================
// BUTTON INTERACTION HANDLERS
// =====================================

async function handleButtonInteraction(interaction) {
    const { customId } = interaction;

    await interaction.deferReply();

    try {
        switch (customId) {
            case 'get_started':
                await handleHelp(interaction);
                break;
            case 'view_spirits':
                await handleSpiritsButton(interaction);
                break;
            case 'random_spirit':
                await handleRandomSpirit(interaction);
                break;
            case 'spirit_details':
                await handleSpiritDetails(interaction);
                break;
            case 'daily_quiz':
                await handleDailyQuiz(interaction);
                break;
            case 'nft_info':
                await handleNFTInfo(interaction);
                break;
            case 'roadmap':
                await handleRoadmapButton(interaction);
                break;
            default:
                await interaction.editReply({ content: 'Button action not implemented yet!', ephemeral: true });
        }
    } catch (error) {
        console.error('Error handling button interaction:', error);
        await interaction.editReply({ content: 'An error occurred. Please try again later.', ephemeral: true });
    }
}

async function handleRandomSpirit(interaction) {
    const spirit = getRandomSpirit();
    const embed = createSpiritEmbed(spirit);
    
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('random_spirit')
                .setLabel('🎲 Another Spirit')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('view_spirits')
                .setLabel('🎭 All Spirits')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}

// =====================================
// ADMIN COMMANDS
// =====================================

async function handleSetup(interaction) {
    // Check if user has administrator permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({ content: '❌ You need Administrator permissions to use this command.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const setupEmbed = createEmbed(
        '🛠️ ALBJ Discord Server Setup',
        'Setting up channels and roles for your ALBJ community...',
        '#ffff00'
    );

    await interaction.editReply({ embeds: [setupEmbed], ephemeral: true });

    try {
        const guild = interaction.guild;
        
        // Create ALBJ role if it doesn't exist
        let albjRole = guild.roles.cache.find(role => role.name === 'ALBJ Holder');
        if (!albjRole) {
            albjRole = await guild.roles.create({
                name: 'ALBJ Holder',
                color: '#00ff88',
                reason: 'ALBJ Bot Setup'
            });
        }

        // Create announcement channel if it doesn't exist
        let announcementChannel = guild.channels.cache.find(ch => ch.name === 'albj-announcements');
        if (!announcementChannel) {
            announcementChannel = await guild.channels.create({
                name: 'albj-announcements',
                type: ChannelType.GuildText,
                topic: 'Daily ALBJ updates and announcements',
                reason: 'ALBJ Bot Setup'
            });
        }

        // Setup complete message
        const completeEmbed = createEmbed(
            '✅ Setup Complete!',
            `**Created/Verified:**\n• Role: ${albjRole}\n• Channel: ${announcementChannel}\n\n**Features Enabled:**\n• Daily spirit updates\n• Welcome messages\n• Cross-platform integration\n• Community engagement tracking`,
            '#00ff88'
        );

        await interaction.followUp({ embeds: [completeEmbed], ephemeral: true });

    } catch (error) {
        console.error('Setup error:', error);
        await interaction.followUp({ content: '❌ Setup failed. Please check bot permissions.', ephemeral: true });
    }
}

// =====================================
// START BOT
// =====================================

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down ALBJ Discord Bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down ALBJ Discord Bot...');
    client.destroy();
    process.exit(0);
});

console.log('🎭 ALBJ Discord Bot initialization complete!');

// Add missing handlers after the existing handlers

async function handleAlebrije(interaction, spiritName) {
    const { getSpiritByName } = require('./spirits');
    const spirit = getSpiritByName(spiritName);
    
    if (!spirit) {
        await interaction.reply({ 
            content: '❌ Spirit not found! Use `/spirits` to see all available Alebrije spirits.', 
            ephemeral: true 
        });
        return;
    }

    const embed = createSpiritEmbed(spirit);
    
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('random_spirit')
                .setLabel('🎲 Random Spirit')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('view_spirits')
                .setLabel('🎭 All Spirits')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel('🌐 Learn More')
                .setURL(`${config.ALBJ_WEBSITE_URL}/spirits/${spiritName}`)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}

async function handleCountdown(interaction) {
    const daysUntilLaunch = calculateDaysUntilLaunch();
    
    const countdownEmbed = createEmbed(
        '⏰ ALBJ Token Launch Countdown',
        `🚀 **Launch Date: June 12, 2025**\n\n🗓️ **Days Remaining: ${daysUntilLaunch} days**\n\n⚡ Get ready for the most culturally-inspired token launch on Solana!\n\n🎭 The Alebrije spirits are preparing for their grand debut!`,
        '#ff6600'
    );
    
    countdownEmbed.addFields(
        { name: '🔥 What to Expect', value: '• 50% token burn\n• Community airdrops\n• NFT collection launch\n• DeFi integrations', inline: true },
        { name: '📈 Market Features', value: '• Liquidity pools ready\n• Anti-bot protection\n• Max wallet: 2% supply\n• Buy/Sell tax: 5%', inline: true },
        { name: '🎨 Special Launch Events', value: '• Alebrije spirit ceremonies\n• Community celebrations\n• Exclusive NFT drops\n• Cultural storytelling', inline: false }
    );

    const countdownButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('token_info')
                .setLabel('📊 Token Info')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('roadmap')
                .setLabel('🗺️ Roadmap')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel('🔔 Set Reminder')
                .setURL(`${config.ALBJ_WEBSITE_URL}/launch-reminder`)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [countdownEmbed], components: [countdownButtons] });
}

async function handlePrice(interaction) {
    const daysUntilLaunch = calculateDaysUntilLaunch();
    
    if (daysUntilLaunch > 0) {
        const preLaunchEmbed = createEmbed(
            '📊 ALBJ Price Check',
            `⚠️ **ALBJ token has not launched yet!**\n\n**Launch Date:** June 12, 2025\n**Days Remaining:** ${daysUntilLaunch} days\n\nPrice tracking will be available after launch. Stay tuned! 🚀`,
            '#ffff00'
        );
        
        await interaction.reply({ embeds: [preLaunchEmbed] });
    } else {
        // Post-launch price functionality
        const { generatePriceData, generateVolumeData, generateMarketCap, generateHolderCount } = require('./daily-updates');
        
        const priceEmbed = createEmbed(
            '📈 ALBJ Live Price Data',
            `**Current Price:** ${generatePriceData()}\n**24h Volume:** ${generateVolumeData()}\n**Market Cap:** ${generateMarketCap()}\n**Holders:** ${generateHolderCount()}`,
            '#00ff88'
        );
        
        await interaction.editReply({ embeds: [priceEmbed] });
    }
}

async function handleRoadmap(interaction) {
    const roadmapEmbed = createEmbed(
        '🗺️ ALBJ Token Roadmap',
        config.ROADMAP,
        '#9932cc'
    );
    
    const roadmapButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('token_info')
                .setLabel('📊 Token Details')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('📄 Whitepaper')
                .setURL(`${config.ALBJ_WEBSITE_URL}/whitepaper.pdf`)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('🌐 Website')
                .setURL(config.ALBJ_WEBSITE_URL)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [roadmapEmbed], components: [roadmapButtons] });
}

async function handleCommunity(interaction) {
    const communityEmbed = createEmbed(
        '👥 ALBJ Community Hub',
        config.SOCIAL_LINKS,
        '#00ffff'
    );
    
    const communityButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('🎮 Discord')
                .setURL('https://discord.gg/vrBnKB68')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('📱 Telegram')
                .setURL('https://t.me/ALBJToken')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('🐦 Twitter')
                .setURL('https://twitter.com/ALBJToken')
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [communityEmbed], components: [communityButtons] });
}

async function handleNFT(interaction) {
    const nftEmbed = createEmbed(
        '🎨 ALBJ Alebrije NFT Collection',
        `🎭 **The First Cultural NFT Collection on Solana**\n\n✨ **Collection Features:**\n• 10,000 unique Alebrije spirits\n• 12 base creature types\n• Infinite trait combinations\n• Cultural storytelling integration\n• Utility in ALBJ ecosystem\n\n🔥 **NFT Benefits:**\n• Governance voting rights\n• Staking rewards\n• Exclusive community access\n• Cultural education content\n• Future game integration\n\n🌟 **Rarity Tiers:**\n• Common (60%) - Cat-Chameleon types\n• Uncommon (25%) - Turtle-Bat, Sheep-Coyote\n• Rare (10%) - Fox-Butterfly, Wolf-Fish, Crab-Dragonfly\n• Epic (4%) - Owl-Serpent, Eagle-Lizard\n• Legendary (0.9%) - Dragon-Jaguar, Snake-Quetzal\n• Mythic (0.1%) - Horse-Phoenix`,
        '#ff69b4'
    );

    const nftButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('view_spirits')
                .setLabel('🎭 View Spirits')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('🖼️ OpenSea')
                .setURL('https://opensea.io/collection/albj-alebrijes')
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('🎨 Gallery')
                .setURL(`${config.ALBJ_WEBSITE_URL}/nft`)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [nftEmbed], components: [nftButtons] });
}

async function handleQuiz(interaction) {
    const quiz = getRandomElement(config.QUIZ_QUESTIONS);
    
    const quizEmbed = createEmbed(
        '🎯 ALBJ Knowledge Quiz',
        `**Question:** ${quiz.question}\n\n**Options:**\nA) ${quiz.options[0]}\nB) ${quiz.options[1]}\nC) ${quiz.options[2]}\nD) ${quiz.options[3]}`,
        '#ffd700'
    );

    const quizButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quiz_0_${quiz.correct}`)
                .setLabel('A')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`quiz_1_${quiz.correct}`)
                .setLabel('B')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`quiz_2_${quiz.correct}`)
                .setLabel('C')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`quiz_3_${quiz.correct}`)
                .setLabel('D')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ 
        embeds: [quizEmbed], 
        components: [quizButtons],
        content: `${quiz.explanation}` // Store explanation for later use
    });
}

async function handleJoke(interaction) {
    try {
        const joke = getRandomElement(config.JOKES);
        const jokeEmbed = createEmbed(
            '😂 Alebrije Humor',
            joke,
            '#ff6600'
        );
        const jokeButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('joke')
                    .setLabel('😂 Another Joke')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('random_spirit')
                    .setLabel('🎭 Random Spirit')
                    .setStyle(ButtonStyle.Secondary)
            );
        await interaction.editReply({ embeds: [jokeEmbed], components: [jokeButtons] });
    } catch (error) {
        // handle error
    }
}

async function handleQuote(interaction) {
    const quote = getRandomElement(config.QUOTES);
    
    const quoteEmbed = createEmbed(
        '💫 Alebrije Wisdom',
        quote,
        '#9932cc'
    );

    const quoteButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('quote')
                .setLabel('🌟 Another Quote')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('random_spirit')
                .setLabel('🎭 Meet the Spirit')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ embeds: [quoteEmbed], components: [quoteButtons] });
}

async function handleMeme(interaction) {
    const meme = getRandomElement(config.MEME_TEMPLATES);
    
    const memeEmbed = createEmbed(
        '🤣 ALBJ Community Memes',
        meme,
        '#ff1493'
    );

    const memeButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('meme')
                .setLabel('🎲 Another Meme')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('📱 Share')
                .setURL(`${config.ALBJ_WEBSITE_URL}/memes`)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [memeEmbed], components: [memeButtons] });
}

async function handleDailyUpdate(interaction) {
    const { generateDailyUpdate } = require('./daily-updates');
    const { getTodaysSpirit } = require('./spirits');
    
    const dailyUpdate = generateDailyUpdate();
    const todaysSpirit = getTodaysSpirit();
    
    const updateEmbed = createEmbed(
        dailyUpdate.title,
        `${dailyUpdate.content}\n\n**Today's Spirit:** ${todaysSpirit.name}\n${todaysSpirit.dailyMessage}`,
        '#ff6600'
    );
    
    updateEmbed.setImage(todaysSpirit.imageUrl);

    const updateButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('spirit_details')
                .setLabel(`🎭 About ${todaysSpirit.name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('view_spirits')
                .setLabel('🌟 All Spirits')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel('🌐 Website')
                .setURL(config.ALBJ_WEBSITE_URL)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.editReply({ embeds: [updateEmbed], components: [updateButtons] });
}

async function handleAnnouncement(interaction) {
    const message = interaction.options.getString('message');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({ content: '❌ You need Administrator permissions to use this command.', ephemeral: true });
        return;
    }

    const announcementEmbed = createEmbed(
        '📢 ALBJ Community Announcement',
        message,
        '#ff0000'
    );
    
    announcementEmbed.setAuthor({ 
        name: interaction.user.displayName, 
        iconURL: interaction.user.displayAvatarURL() 
    });

    try {
        await targetChannel.send({ embeds: [announcementEmbed] });
        await interaction.editReply({ content: `✅ Announcement sent to ${targetChannel}!`, ephemeral: true });
        
        // Log announcement
        console.log(`📢 Announcement by ${interaction.user.tag} in ${targetChannel.name}: ${message}`);
        
    } catch (error) {
        console.error('Error sending announcement:', error);
        await interaction.editReply({ content: '❌ Failed to send announcement. Check bot permissions.', ephemeral: true });
    }
}

// Additional button handlers
async function handleSpiritsButton(interaction) {
    await handleSpirits(interaction);
}

async function handleSpiritDetails(interaction) {
    const { getTodaysSpirit } = require('./spirits');
    const spirit = getTodaysSpirit();
    const embed = createSpiritEmbed(spirit);
    
    await interaction.editReply({ embeds: [embed], ephemeral: true });
}

async function handleDailyQuiz(interaction) {
    await handleQuiz(interaction);
}

async function handleNFTInfo(interaction) {
    await handleNFT(interaction);
}

async function handleRoadmapButton(interaction) {
    await handleRoadmap(interaction);
}

// Handle prefix commands for backward compatibility
async function handlePrefixCommand(message, commandName, args) {
    // Simple prefix command support
    await interaction.deferReply();

    switch (commandName) {
        case 'help':
            await message.reply('Use `/help` for the full command list! 🎭');
            break;
        case 'spirits':
            await message.reply('Use `/spirits` to see all Alebrije spirits! 🐉');
            break;
        case 'info':
            await message.reply('Use `/info` for detailed token information! 📊');
            break;
        default:
            // Don't respond to unknown prefix commands
            break;
    }
}

module.exports = { app, client }; 