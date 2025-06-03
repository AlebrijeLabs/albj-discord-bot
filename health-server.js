// Standalone Health Check Server
const express = require('express');
const http = require('http');

console.log('🔍 Starting standalone health check server...');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'albj-discord-bot'
  });
  console.log('Health check responded with status 200');
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint requested');
  res.status(200).send('ALBJ Discord Bot Health Server');
  console.log('Root endpoint responded with status 200');
});

// Start the server
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down health check server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down health check server...');
  server.close();
  process.exit(0);
});

// Keep the server running
console.log('Health server running indefinitely...');

// Export app for testing
module.exports = app; 