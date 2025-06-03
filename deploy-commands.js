const { REST, Routes } = require('discord.js');
const config = require('./config');
const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
  // 📊 BASIC COMMANDS
  { name: 'start', description: 'Welcome & main menu' },
  { name: 'help', description: 'Show this help menu' },
  { name: 'hello', description: 'Interactive greeting' },
  { name: 'funfact', description: 'Random ALBJ fact' },

  // 💰 TOKEN INFORMATION
  { name: 'info', description: 'Complete token details' },
  { name: 'price', description: 'Price check (post-launch)' },
  { name: 'holders', description: 'Holder statistics' },
  { name: 'roadmap', description: 'Development roadmap' },
  { name: 'countdown', description: 'Launch countdown' },
  { name: 'launch', description: 'Launch day information' },
  { name: 'tokenomics', description: 'Token distribution' },

  // 🎨 NFT & SPIRITS
  { name: 'nft', description: 'NFT collection preview' },
  { name: 'spirits', description: 'View all 12 Alebrije creatures' },
  {
    name: 'alebrije',
    description: 'Individual spirit info',
    options: [
      {
        name: 'name',
        description: 'Name of the Alebrije spirit (e.g. dragon-jaguar)',
        type: 3, // STRING
        required: true
      }
    ]
  },
  { name: 'culture', description: 'Mexican folklore background' },

  // 👥 COMMUNITY
  { name: 'community', description: 'Community links' },
  { name: 'team', description: 'Meet the team' },
  { name: 'careers', description: 'Job opportunities' },
  { name: 'events', description: 'Upcoming events' },
  { name: 'social', description: 'Social media links' },

  // 🆘 SUPPORT
  { name: 'support', description: 'Help & support center' },
  { name: 'faq', description: 'Frequently asked questions' },

  // 🎭 FUN & GAMES
  { name: 'quote', description: 'Inspirational quotes' },
  { name: 'joke', description: 'ALBJ themed jokes' },
  { name: 'meme', description: 'Community memes' },
  { name: 'quiz', description: 'Test your knowledge' },

  // 🏆 ENGAGEMENT
  { name: 'checkin', description: 'Daily spirit check-in' },
  { name: 'mystats', description: 'View your progress' },

  // 🔔 NOTIFICATIONS
  { name: 'notifications', description: 'Manage alert preferences' },
  { name: 'alerts', description: 'Same as /notifications' },

  // 🛠️ TOOLS
  { name: 'pricealert', description: 'Price monitoring (post-launch)' }
];

// Remove duplicate command definitions
const uniqueCommands = commands.filter((command, index, self) =>
  index === self.findIndex((t) => t.name === command.name)
);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.DISCORD_BOT_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`🚀 Started refreshing ${uniqueCommands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'),
      { body: uniqueCommands },
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    console.log('🎭 ALBJ Discord bot commands are ready!');
    
    // List deployed commands
    console.log('\n📋 Deployed commands:');
    uniqueCommands.forEach(cmd => {
      console.log(`   /${cmd.name} - ${cmd.description}`);
    });

  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})(); 