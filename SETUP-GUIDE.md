# 🎭 ALBJ Discord Bot Setup Guide

This guide will walk you through setting up the comprehensive ALBJ Discord bot with all features enabled.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Discord account with server admin permissions
- Basic knowledge of Discord bot setup

### 1. Create Discord Application

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click "New Application"
   - Name it "ALBJ Token Bot"

2. **Create Bot User**
   - Go to "Bot" section in left sidebar
   - Click "Add Bot" 
   - Copy the bot token (keep this secure!)
   - Enable "Message Content Intent" for prefix commands

3. **Get Application ID**
   - Go to "General Information"
   - Copy "Application ID" (this is your Client ID)

4. **Generate Invite Link**
   - Go to "OAuth2" > "URL Generator"
   - **Scopes:** Select `bot` and `applications.commands`
   - **Bot Permissions:** Select these permissions:
     ```
     ✅ Send Messages
     ✅ Use Slash Commands  
     ✅ Embed Links
     ✅ Attach Files
     ✅ Read Message History
     ✅ Add Reactions
     ✅ Manage Messages
     ✅ Manage Roles
     ✅ Manage Channels
     ✅ View Channels
     ✅ Connect (Voice)
     ✅ Speak (Voice)
     ```
   - Copy the generated URL and use it to invite the bot to your server

### 2. Bot Setup

1. **Clone/Download the code**
   ```bash
   git clone <repository>
   cd discord-bot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your tokens:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   ```

4. **Deploy Slash Commands**
   ```bash
   node deploy-commands.js
   ```
   You should see: "✅ Successfully reloaded X application (/) commands."

5. **Start the Bot**
   ```bash
   npm start
   ```

## 🎯 Testing Your Bot

### Basic Commands Test
Try these commands in your Discord server:

1. **`/help`** - Should show the full command list
2. **`/info`** - Should display ALBJ token information  
3. **`/spirits`** - Should show all 12 Alebrije spirits
4. **`/alebrije dragon-jaguar`** - Should show Dragon-Jaguar details
5. **`/countdown`** - Should show launch countdown

### Admin Commands Test (as server admin):
1. **`/setup`** - Should create ALBJ channels and roles
2. **`/announce "Test message"`** - Should send an announcement

### Interactive Features Test:
1. **Welcome new member** - Invite someone or use an alt account
2. **Button interactions** - Click buttons on bot responses
3. **Daily updates** - Use `/daily` to see today's update

## 🛠️ Server Configuration

### Automatic Setup
Run `/setup` as a server administrator to automatically create:

**Channels:**
- `#albj-announcements` - Official announcements
- `#albj-general` - General discussion  
- `#albj-price-talk` - Price/market discussion
- `#albj-nft-showcase` - NFT displays
- `#albj-games` - Bot games and activities
- `#albj-support` - Help and support

**Roles:**
- `ALBJ Holder` - Token holders (green)
- `NFT Collector` - NFT owners (purple)  
- `Community Helper` - Community moderators (orange)
- `Spirit Guide` - Advanced moderators (gold)

### Manual Configuration

If you prefer manual setup or want custom names:

1. **Create channels** with these topics:
   - Announcements: "Daily ALBJ updates and announcements"
   - General: "General discussion about ALBJ Token"
   - Price talk: "Price discussion and market analysis"

2. **Create roles** with appropriate colors and permissions

3. **Set bot permissions** in each channel as needed

## 🕒 Scheduled Features

The bot automatically runs:

### Daily Updates (9:00 AM UTC)
- Community growth statistics
- Featured spirit of the day
- Development progress updates
- Launch countdown (pre-launch)
- Market data (post-launch)

### Evening Updates (6:00 PM UTC)  
- Market summary
- Community highlights
- Upcoming events

### Weekend Updates
- Weekly achievements
- Community spotlights
- Upcoming week preview

## 🔄 Cross-Platform Integration

To enable Telegram integration:

1. **Get Telegram bot token** (if you have the ALBJ Telegram bot)
2. **Add to config.js:**
   ```javascript
   TELEGRAM_BOT_TOKEN: 'your_telegram_bot_token',
   TELEGRAM_CHANNEL_ID: 'your_telegram_channel_id'
   ```
3. **Enable sync in config:**
   ```javascript
   CROSS_PLATFORM_SYNC: true
   ```

## 🎮 Advanced Features

### Welcome System
- Automatically greets new members
- Assigns random Alebrije spirit
- Sends onboarding DM
- Suggests relevant roles

### Reaction Roles (Future Feature)
- React with spirit emojis to get roles
- Automatic role assignment
- Easy role management

### Voice Channel Management (Future Feature)
- Dynamic channel creation
- Spirit-themed channel names
- Automatic cleanup

## 🚨 Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Check bot is online (green status)
- Verify bot has "Send Messages" permission
- Ensure commands were deployed with `deploy-commands.js`

**Slash commands not appearing:**
- Wait 1-2 minutes after deployment
- Try refreshing Discord (Ctrl+R)
- Check bot has "Use Slash Commands" permission

**Setup command fails:**
- Ensure you have Administrator permissions  
- Check bot has "Manage Channels" and "Manage Roles" permissions

**Daily updates not working:**
- Bot must stay online 24/7
- Check server time zone settings
- Verify announcement channel exists

### Permission Requirements

**Minimum permissions for basic functionality:**
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History

**Additional permissions for full features:**
- Manage Messages (for moderation)
- Manage Roles (for role assignment)
- Manage Channels (for setup command)
- Add Reactions (for reaction roles)

### Logs and Debugging

Check console output for:
- `✅ ALBJ Discord Bot is ready!` - Bot started successfully
- `🌟 Daily updates scheduler started!` - Scheduled tasks enabled
- Error messages for troubleshooting

## 📊 Usage Analytics

The bot logs:
- Command usage statistics
- User engagement metrics  
- Daily update delivery status
- Error rates and performance data

Check console output to monitor bot health and usage patterns.

## 🔒 Security Notes

- **Never share your bot token** - It's like a password
- **Use environment variables** for sensitive data
- **Regular permission audits** - Remove unnecessary permissions
- **Monitor logs** for suspicious activity

## 🚀 Production Deployment

### Local 24/7 Hosting
```bash
# Install PM2 for process management
npm install -g pm2

# Start bot with PM2
pm2 start bot.js --name "albj-discord-bot"

# Set up auto-restart on server reboot
pm2 startup
pm2 save
```

### Cloud Hosting Options

**Railway (Recommended):**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

**Heroku:**
1. Create new app
2. Set config vars in dashboard
3. Deploy via GitHub integration

**VPS/Dedicated Server:**
1. Upload files via SSH/FTP
2. Install Node.js and dependencies
3. Use PM2 or systemd for process management

## 📞 Support

**Need help?**
- **Discord:** Join our community server
- **Telegram:** @ALBJTokenBot for cross-platform support
- **Website:** https://albj.io for documentation
- **GitHub:** Open an issue for bugs/features

## 🎭 Features Roadmap

### Coming Soon:
- **Reaction roles** - Auto role assignment via reactions
- **Voice channel automation** - Dynamic voice channel management  
- **Gaming integration** - Spirit-based mini-games
- **NFT verification** - Verify NFT ownership for special roles
- **Staking dashboard** - View staking rewards via bot
- **Cross-chain integration** - Multi-blockchain support

### Future Releases:
- **AI chat integration** - Chat with Alebrije spirits
- **Cultural education** - Interactive folklore lessons
- **Community governance** - DAO voting via Discord
- **Metaverse integration** - Virtual world connections

---

🎭 **Congratulations! Your ALBJ Discord bot is now ready to serve the community with the power of Alebrije spirits!** ✨ 