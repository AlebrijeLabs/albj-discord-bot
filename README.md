# 🎭 ALBJ Discord Bot

A comprehensive Discord bot for the ALBJ Token community featuring Alebrije spirits, cross-platform integration, and advanced community management.

## 🌟 Features

### 🎨 Core Features
- **12 Alebrije Spirits** - Interactive spirit collection with detailed lore
- **Daily Updates** - Automated daily community updates with spirit rotations
- **Cross-Platform Integration** - Syncs with Telegram bot for unified community
- **Launch Countdown** - Real-time countdown to June 12, 2025 token launch
- **Community Management** - Welcome messages, role management, server setup

### 🎮 Interactive Commands
- **Token Information** (`/info`, `/price`, `/holders`, `/tokenomics`)
- **Spirit Exploration** (`/spirits`, `/alebrije [name]`, random spirits)
- **Community Fun** (`/quiz`, `/joke`, `/quote`, `/meme`, `/funfact`)
- **Social Features** (`/community`, `/social`, `/team`, `/events`)
- **Admin Tools** (`/setup`, `/announce`, role management)

### 🤖 Automation Features
- **Daily Updates** - Scheduled at 9:00 AM and 6:00 PM UTC
- **Welcome System** - Greets new members with spirit assignments
- **Reaction Roles** - Automated role assignment via reactions
- **Voice Channel Management** - Dynamic channel creation/deletion
- **Cross-Platform Sync** - Updates shared between Discord and Telegram

## 🚀 Setup Instructions

### 1. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Go to "OAuth2" > "URL Generator"
   - Select "bot" and "applications.commands" scopes
   - Select necessary permissions (Administrator recommended for full features)
6. Use the generated URL to invite the bot to your server

### 2. Environment Configuration

1. Copy `env.example` to `.env`
2. Fill in your Discord bot token and client ID:
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Deploy Slash Commands

```bash
node deploy-commands.js
```

### 5. Start the Bot

```bash
npm start
# or for development
npm run dev
```

## 📋 Command List

### 📊 Basic Commands
- `/help` - Show all available commands
- `/info` - ALBJ token information
- `/countdown` - Launch countdown
- `/price` - Price check (post-launch)

### 🎨 Alebrije Spirits
- `/spirits` - View all 12 spirits
- `/alebrije [name]` - Individual spirit info
- `/daily` - Today's featured spirit

### 🎭 Fun & Games
- `/quiz` - Knowledge quiz
- `/joke` - Alebrije-themed jokes
- `/quote` - Inspirational quotes
- `/meme` - Community memes
- `/funfact` - Random facts

### 👥 Community
- `/community` - Community links
- `/social` - Social media links
- `/team` - Meet the team
- `/events` - Upcoming events

### 🛠️ Admin Commands
- `/setup` - Server setup (creates channels/roles)
- `/announce [message]` - Send announcements

## 🎭 The 12 Alebrije Spirits

### 🔥 Fire Spirits
- **🐉 Dragon-Jaguar** - Legendary courage and strength
- **🦅 Eagle-Lizard** - Epic vision and determination  
- **🐴 Horse-Phoenix** - Mythic rebirth and freedom

### 💧 Water Spirits
- **🐺 Wolf-Fish** - Rare loyalty and instinct
- **🦀 Crab-Dragonfly** - Rare creativity and perspective
- **🐸 Frog-Hummingbird** - Uncommon adaptation and healing

### 🌬️ Air Spirits
- **🦉 Owl-Serpent** - Epic wisdom and knowledge
- **🦋 Fox-Butterfly** - Rare transformation and joy
- **🐦 Snake-Quetzal** - Legendary divinity and change

### 🌍 Earth Spirits
- **🐢 Turtle-Bat** - Uncommon patience and perception
- **🐱 Cat-Chameleon** - Common adaptability and observation
- **🐑 Sheep-Coyote** - Uncommon balance and harmony

## 🔄 Cross-Platform Integration

The Discord bot integrates with the ALBJ Telegram bot to provide:
- **Unified Daily Updates** - Same updates across platforms
- **Cross-Platform Announcements** - Important news shared everywhere
- **Community Sync** - Member activities tracked across platforms
- **Spirit Features** - Consistent spirit experiences

## 🛠️ Server Setup Features

The `/setup` command automatically creates:

### Channels
- `#albj-announcements` - Official announcements
- `#albj-general` - General discussion
- `#albj-price-talk` - Price and market discussion
- `#albj-nft-showcase` - NFT displays
- `#albj-games` - Bot games and activities
- `#albj-support` - Help and support

### Roles
- `ALBJ Holder` - Token holders
- `NFT Collector` - NFT owners
- `Community Helper` - Community moderators
- `Spirit Guide` - Advanced moderators

## 📅 Scheduled Features

### Daily Updates (9:00 AM UTC)
- Community statistics
- Featured spirit of the day
- Development progress
- Launch countdown
- Cross-platform sync

### Evening Updates (6:00 PM UTC)
- Market summary (post-launch)
- Community highlights
- Upcoming events

### Weekend Updates
- Weekly review
- Community achievements
- Upcoming week preview

## 🎯 Advanced Features

### Welcome System
- Random spirit assignment for new members
- Personalized welcome messages
- Role suggestions
- Direct message onboarding

### Reaction Roles
- Automatic role assignment via emoji reactions
- Spirit-based role selection
- Community interest roles

### Voice Channel Management
- Dynamic channel creation
- Automatic cleanup
- Spirit-themed channel names

## 🚀 Deployment Options

### Local Development
```bash
npm run dev
```

### Production Deployment

#### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### Heroku
1. Create Heroku app
2. Set config vars
3. Deploy via Git

#### VPS/Cloud
1. Upload files
2. Install dependencies
3. Use PM2 for process management
```bash
pm2 start bot.js --name "albj-discord-bot"
```

## 📊 Monitoring & Analytics

The bot includes logging for:
- Command usage statistics
- User engagement tracking
- Error monitoring
- Performance metrics
- Cross-platform sync status

## 🔒 Security Features

- Permission-based command access
- Rate limiting on commands
- Input validation
- Secure token handling
- Admin-only sensitive commands

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Discord:** [ALBJ Community Server](https://discord.gg/vrBnKB68)
- **Telegram:** [@ALBJTokenBot](https://t.me/ALBJTokenBot)
- **Website:** [https://albj.io](https://albj.io)

## 📄 License

MIT License - See LICENSE file for details

---

🎭 **Built with the power of Alebrije spirits for the ALBJ community!** ✨ 