# Use official Node.js image
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose port for health checks
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the bot
CMD ["node", "bot.js"] 