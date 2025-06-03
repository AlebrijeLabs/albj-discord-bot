const { EmbedBuilder } = require('discord.js');
const config = require('../config');

const ALBJ_FACTS = [
    "ALBJ Token is inspired by the magical Alebrije creatures from Mexican folklore!",
    "Each Alebrije spirit represents a unique aspect of Mexican culture and mythology.",
    "The ALBJ Token launch is set for June 12, 2025 - a date of cultural significance!",
    "Alebrijes originated in Oaxaca, Mexico, and are known for their vibrant colors and fantastical designs.",
    "The word 'Alebrije' was first coined by Pedro Linares López in the 1930s.",
    "In Mexican tradition, Alebrijes are believed to guide and protect people's spirits.",
    "ALBJ Token aims to bridge traditional Mexican art with modern blockchain technology.",
    "Our 12 Alebrije spirits represent different elements and cultural archetypes.",
    "The ALBJ project is committed to supporting indigenous Mexican art and communities.",
    "Blockchain technology allows us to preserve and share cultural heritage in a new way."
];

async function handleStart(interaction) {
    const startEmbed = new EmbedBuilder()
        .setTitle('🌟 Welcome to ALBJ Token!')
        .setDescription('Your journey with Alebrije Spirits begins here!')
        .setColor('#ff6600')
        .addFields(
            { 
                name: '🎭 What is ALBJ?', 
                value: 'A revolutionary token inspired by Mexican Alebrije spirits, blending blockchain technology with cultural heritage.' 
            },
            { 
                name: '🚀 Quick Links', 
                value: `• [Website](${config.ALBJ_WEBSITE_URL})\n• [Discord](${config.ALBJ_DISCORD_URL})\n• [Twitter](${config.ALBJ_TWITTER_URL})` 
            },
            { 
                name: '📋 Recommended Commands', 
                value: '• `/spirits` - Meet the Alebrije creatures\n• `/info` - Token details\n• `/roadmap` - Project timeline\n• `/help` - See all commands' 
            }
        )
        .setImage(config.ALBJ_BANNER_URL)
        .setFooter({ text: 'Your cultural blockchain adventure starts now!' });

    await interaction.editReply({ embeds: [startEmbed], ephemeral: true });
}

async function handleHello(interaction) {
    const greetings = [
        `¡Hola! 🌞 Ready to explore the world of Alebrije Spirits?`,
        `Greetings, brave adventurer! 🐉 Which spirit calls to you today?`,
        `Welcome, blockchain explorer! 🚀 Let's dive into the ALBJ universe!`,
        `Bienvenidos! 🎉 Your magical journey begins now!`
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    await interaction.editReply({ content: randomGreeting, ephemeral: true });
}

async function handleFunFact(interaction) {
    const randomFact = ALBJ_FACTS[Math.floor(Math.random() * ALBJ_FACTS.length)];
    const factEmbed = new EmbedBuilder()
        .setTitle('🌈 ALBJ Fun Fact!')
        .setDescription(randomFact)
        .setColor('#00ff88')
        .setFooter({ text: 'Knowledge is power in the ALBJ universe!' });

    await interaction.editReply({ embeds: [factEmbed], ephemeral: true });
}

async function handleHolders(interaction) {
    // Placeholder for real-time holder statistics
    const holderEmbed = new EmbedBuilder()
        .setTitle('📊 ALBJ Token Holder Statistics')
        .setDescription('Real-time holder information coming soon!')
        .addFields(
            { name: 'Total Holders', value: 'Tracking in progress', inline: true },
            { name: 'Top Holders', value: 'Data being compiled', inline: true }
        )
        .setColor('#00ff88')
        .setFooter({ text: 'Accurate data will be available post-launch' });

    await interaction.editReply({ embeds: [holderEmbed], ephemeral: true });
}

async function handleLaunch(interaction) {
    const launchEmbed = new EmbedBuilder()
        .setTitle('🚀 ALBJ Token Launch')
        .setDescription('Mark your calendars for our epic token launch!')
        .addFields(
            { name: '📅 Launch Date', value: 'June 12, 2025', inline: true },
            { name: '⏰ Time', value: 'TBD (UTC)', inline: true },
            { name: '🌐 Platforms', value: 'Major DEXs and CEXs', inline: false },
            { 
                name: '🎉 Launch Celebration', 
                value: 'Special NFT drops, community events, and exclusive rewards for early supporters!' 
            }
        )
        .setColor('#ff6600')
        .setFooter({ text: 'The Alebrije spirits are awakening!' });

    await interaction.editReply({ embeds: [launchEmbed], ephemeral: true });
}

async function handleTokenomics(interaction) {
    const tokenomicsEmbed = new EmbedBuilder()
        .setTitle('💰 ALBJ Token Distribution')
        .setDescription('Transparent and community-focused tokenomics')
        .addFields(
            { name: '🔹 Total Supply', value: '1,000,000,000 ALBJ', inline: true },
            { name: '🔹 Initial Circulating Supply', value: '200,000,000 ALBJ', inline: true },
            { 
                name: '📊 Distribution Breakdown', 
                value: `
                • Community Allocation: 40%
                • Team & Advisors: 15%
                • Marketing & Partnerships: 20%
                • Development Fund: 15%
                • Liquidity Pool: 10%
                ` 
            },
            { 
                name: '🔒 Vesting Schedule', 
                value: 'Team tokens locked with gradual 3-year release' 
            }
        )
        .setColor('#00ff88')
        .setFooter({ text: 'Fair and transparent token economics' });

    await interaction.editReply({ embeds: [tokenomicsEmbed], ephemeral: true });
}

async function handleCulture(interaction) {
    const cultureEmbed = new EmbedBuilder()
        .setTitle('🎨 Mexican Folklore & Alebrijes')
        .setDescription('Discover the rich cultural heritage behind ALBJ Token')
        .addFields(
            { 
                name: '🐉 What are Alebrijes?', 
                value: 'Fantastical creatures from Oaxacan folk art, combining multiple animal features with vibrant colors.' 
            },
            { 
                name: '🖌️ Origin', 
                value: 'Created by Pedro Linares López in the 1930s during a fever dream, later popularized by wood carvers in Oaxaca.' 
            },
            { 
                name: '🌈 Spiritual Significance', 
                value: 'Believed to be spirit guides that protect and represent an individual\'s inner self.' 
            },
            { 
                name: '🤝 ALBJ\'s Cultural Mission', 
                value: 'Preserving and celebrating Mexican cultural heritage through blockchain technology' 
            }
        )
        .setImage(config.ALEBRIJE_CULTURE_IMAGE_URL)
        .setColor('#ff6600')
        .setFooter({ text: 'Honoring tradition, embracing innovation' });

    await interaction.editReply({ embeds: [cultureEmbed], ephemeral: true });
}

async function handleTeam(interaction) {
    const teamEmbed = new EmbedBuilder()
        .setTitle('👥 ALBJ Token Team')
        .setDescription('Meet the passionate individuals behind the project')
        .addFields(
            { 
                name: '🧑‍💻 Founder & CEO', 
                value: 'Carlos Hernandez - Blockchain expert with 10+ years in crypto' 
            },
            { 
                name: '🎨 Creative Director', 
                value: 'Maria Rodriguez - Expert in Mexican folk art and design' 
            },
            { 
                name: '🔬 Technical Lead', 
                value: 'Alex Chen - Blockchain architect, previously at major tech firms' 
            },
            { 
                name: '🌐 Community Manager', 
                value: 'Diego Morales - Passionate about cultural preservation' 
            }
        )
        .setColor('#00ff88')
        .setFooter({ text: 'Diverse talents, united vision' });

    await interaction.editReply({ embeds: [teamEmbed], ephemeral: true });
}

async function handleCareers(interaction) {
    const careersEmbed = new EmbedBuilder()
        .setTitle('💼 Career Opportunities')
        .setDescription('Join the ALBJ Token revolution!')
        .addFields(
            { 
                name: '🚀 Open Positions', 
                value: `
                • Blockchain Developer
                • Smart Contract Engineer
                • Community Moderator
                • Marketing Specialist
                • Graphic Designer
                ` 
            },
            { 
                name: '📧 Application', 
                value: 'Send your resume to careers@albj.io with the position title' 
            }
        )
        .setColor('#ff6600')
        .setFooter({ text: 'Grow with us, shape the future!' });

    await interaction.editReply({ embeds: [careersEmbed], ephemeral: true });
}

async function handleEvents(interaction) {
    const eventsEmbed = new EmbedBuilder()
        .setTitle('🎉 Upcoming ALBJ Events')
        .setDescription('Mark your calendars!')
        .addFields(
            { 
                name: '🚀 Token Launch', 
                value: 'June 12, 2025 - Global Online Event', 
                inline: true 
            },
            { 
                name: '🎨 Art & Blockchain Symposium', 
                value: 'July 15, 2025 - Virtual Conference', 
                inline: true 
            },
            { 
                name: '🌐 Community AMA', 
                value: 'Monthly on our Discord', 
                inline: false 
            }
        )
        .setColor('#00ff88')
        .setFooter({ text: 'Stay tuned for more exciting events!' });

    await interaction.editReply({ embeds: [eventsEmbed], ephemeral: true });
}

async function handleSocial(interaction) {
    const socialEmbed = new EmbedBuilder()
        .setTitle('🌐 ALBJ Token Social Links')
        .setDescription('Connect with our vibrant community!')
        .addFields(
            { name: '🌍 Website', value: config.ALBJ_WEBSITE_URL, inline: true },
            { name: '🐦 Twitter', value: config.ALBJ_TWITTER_URL, inline: true },
            { name: '🎮 Discord', value: config.ALBJ_DISCORD_URL, inline: true },
            { name: '📸 Instagram', value: 'Coming Soon', inline: true },
            { name: '📘 Facebook', value: 'Coming Soon', inline: true }
        )
        .setColor('#ff6600')
        .setFooter({ text: 'Join our global community!' });

    await interaction.editReply({ embeds: [socialEmbed], ephemeral: true });
}

async function handleSupport(interaction) {
    await interaction.editReply({ embeds: [supportEmbed], ephemeral: true });
}

async function handleFAQ(interaction) {
    const faqEmbed = new EmbedBuilder()
        .setTitle('❓ Frequently Asked Questions')
        .setDescription('Quick answers to common queries')
        .addFields(
            { 
                name: '🚀 What is ALBJ Token?', 
                value: 'A blockchain project celebrating Mexican cultural heritage through Alebrije spirits.' 
            },
            { 
                name: '💰 How can I buy ALBJ?', 
                value: 'Tokens will be available on major exchanges after our June 12, 2025 launch.' 
            },
            { 
                name: '🎨 What are Alebrijes?', 
                value: 'Magical creatures from Mexican folk art, each with unique spiritual significance.' 
            },
            { 
                name: '📈 Is this a good investment?', 
                value: 'Always do your own research and consult financial advisors.' 
            }
        )
        .setColor('#ff6600')
        .setFooter({ text: 'Knowledge is power!' });

    await interaction.editReply({ embeds: [faqEmbed], ephemeral: true });
}

async function handlePriceAlert(interaction) {
    const alertEmbed = new EmbedBuilder()
        .setTitle('💹 Price Alert Setup')
        .setDescription('Configure your price monitoring preferences')
        .addFields(
            { 
                name: '🔔 Feature Coming Soon', 
                value: 'Price alert functionality will be available after token launch.' 
            }
        )
        .setColor('#00ff88')
        .setFooter({ text: 'Stay informed about ALBJ Token price movements!' });

    await interaction.editReply({ embeds: [alertEmbed], ephemeral: true });
}

module.exports = {
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
}; 