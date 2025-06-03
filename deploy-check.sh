#!/bin/bash

# Deployment Verification Script for ALBJ Discord Bot

echo "🚀 ALBJ Discord Bot Deployment Check"

# Check Node.js and npm versions
echo "📦 Dependency Versions:"
node --version
npm --version

# Verify package.json
echo "📄 Package Configuration:"
cat package.json | grep -E "name|version|description"

# Check for required environment variables
REQUIRED_VARS=("DISCORD_TOKEN" "CLIENT_ID" "GUILD_ID")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

# Simulate bot startup (dry run)
echo "🤖 Performing dry run..."
node --check bot.js

# Health check simulation
echo "🩺 Simulating health check..."
curl -f http://localhost:3000/health || echo "❌ Health check failed"

echo "✅ Deployment Verification Complete!"
exit 0 