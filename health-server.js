// Standalone Health Check Server
const express = require('express');
const http = require('http');
const fs = require('fs');

// Add timestamp for debugging
const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  
  // Also write to file for debugging
  try {
    fs.appendFileSync('/tmp/health-server.log', `[${timestamp}] ${message}\n`);
  } catch (err) {
    // Ignore file write errors
  }
};

logWithTimestamp('🔍 Starting standalone health check server...');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Log every request
app.use((req, res, next) => {
  logWithTimestamp(`Request received: ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  logWithTimestamp('Health check requested');
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'albj-discord-bot'
  });
  logWithTimestamp('Health check responded with status 200');
});

// Root endpoint
app.get('/', (req, res) => {
  logWithTimestamp('Root endpoint requested');
  res.status(200).send('ALBJ Discord Bot Health Server');
  logWithTimestamp('Root endpoint responded with status 200');
});

// Special debug endpoint
app.get('/debug', (req, res) => {
  logWithTimestamp('Debug endpoint requested');
  
  // Collect system info
  const debug = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
      version: process.version
    }
  };
  
  res.status(200).json(debug);
  logWithTimestamp('Debug endpoint responded');
});

// Start the server with error handling
let startAttempts = 0;
const maxAttempts = 3;

function startServer() {
  try {
    startAttempts++;
    logWithTimestamp(`Starting server attempt ${startAttempts}/${maxAttempts}`);
    
    const server = http.createServer(app);
    
    // Add error handler for the server
    server.on('error', (err) => {
      logWithTimestamp(`Server error: ${err.message}`);
      
      if (err.code === 'EADDRINUSE' && startAttempts < maxAttempts) {
        logWithTimestamp(`Port ${PORT} in use, retrying in 2 seconds...`);
        setTimeout(startServer, 2000);
      }
    });
    
    server.listen(PORT, '0.0.0.0', () => {
      logWithTimestamp(`✅ Health check server running on port ${PORT}`);
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        logWithTimestamp('Received SIGINT, shutting down health check server...');
        server.close();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        logWithTimestamp('Received SIGTERM, shutting down health check server...');
        server.close();
        process.exit(0);
      });
      
      // Handle unexpected errors
      process.on('uncaughtException', (err) => {
        logWithTimestamp(`Uncaught exception: ${err.message}`);
        logWithTimestamp(err.stack);
        // Keep server running despite errors
      });
      
      process.on('unhandledRejection', (reason, promise) => {
        logWithTimestamp('Unhandled promise rejection');
        logWithTimestamp(reason);
        // Keep server running despite errors
      });
    });
    
    return server;
  } catch (err) {
    logWithTimestamp(`Failed to start server: ${err.message}`);
    if (startAttempts < maxAttempts) {
      logWithTimestamp('Retrying in 2 seconds...');
      setTimeout(startServer, 2000);
    }
  }
}

// Start the server
const server = startServer();

// Keep the server running
logWithTimestamp('Health server running indefinitely...');

// Export app for testing
module.exports = { app, server }; 