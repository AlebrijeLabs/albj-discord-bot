# Use official Node.js image with correct version
FROM node:20-alpine

# Install system dependencies including curl explicitly
RUN apk add --no-cache python3 make g++ curl bash

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

# Create a more robust start script with emergency fallback
RUN echo '#!/bin/bash\n\
echo "Starting health server..."\n\
node health-server.js > /tmp/health-server.out.log 2> /tmp/health-server.err.log &\n\
HEALTH_PID=$!\n\
echo "Health server started with PID: $HEALTH_PID"\n\
\n\
# Wait for health server to start\n\
echo "Waiting for health server to become available..."\n\
attempts=0\n\
max_attempts=10\n\
while [ $attempts -lt $max_attempts ]; do\n\
  if curl -s http://localhost:3000/health > /dev/null; then\n\
    echo "Health server is responding!"\n\
    break\n\
  fi\n\
  attempts=$((attempts+1))\n\
  echo "Health check attempt $attempts/$max_attempts failed, retrying..."\n\
  sleep 1\n\
done\n\
\n\
# Start emergency debug server if health server fails\n\
if [ $attempts -eq $max_attempts ]; then\n\
  echo "Health server failed to start. Starting emergency debug server..."\n\
  kill -9 $HEALTH_PID 2>/dev/null || true\n\
  node debug-server.js > /tmp/debug-server.out.log 2> /tmp/debug-server.err.log &\n\
fi\n\
\n\
# Start Discord bot\n\
echo "Starting Discord bot..."\n\
node bot.js > /tmp/discord-bot.out.log 2> /tmp/discord-bot.err.log\n' > start.sh && chmod +x start.sh

# Set retries to 15 with longer intervals for more patience
HEALTHCHECK --interval=5s --timeout=15s --start-period=15s --retries=15 \
  CMD curl -v http://localhost:3000/health || exit 1

# Run both the health check server and the Discord bot
CMD ["./start.sh"] 