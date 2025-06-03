# Use official Node.js image with correct version
FROM node:20-alpine

# Install system dependencies including curl explicitly
RUN apk add --no-cache python3 make g++ curl

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies without using the package lock to resolve version conflicts
RUN npm install --production --no-package-lock

# Copy the rest of the application code
COPY . .

# Expose port for health checks
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Set retries to 10 to give more time to start up
HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=10 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run the bot
CMD ["node", "bot.js"] 