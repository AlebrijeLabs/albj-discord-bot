/**
 * Debug script for Railway deployments
 * This is a minimal script that only handles health checks
 * Used as a last resort if other solutions fail
 */

const http = require('http');
const fs = require('fs');
const os = require('os');

// Log configuration
const LOG_FILE = '/tmp/debug-server.log';
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (err) {
    // Ignore file write errors
  }
}

// Start message
log('===== EMERGENCY DEBUG SERVER STARTING =====');
log(`Node.js version: ${process.version}`);
log(`Platform: ${os.platform()} ${os.release()}`);
log(`Memory: ${Math.round(os.freemem() / 1024 / 1024)}MB free of ${Math.round(os.totalmem() / 1024 / 1024)}MB`);

// Create an extremely simple HTTP server
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  const { method, url } = req;
  log(`Request received: ${method} ${url}`);
  
  // Handle health check
  if (url === '/health') {
    log('Health check requested');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      mode: 'emergency-debug-server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
    log('Health check responded with status 200');
    return;
  }
  
  // Handle root path
  if (url === '/') {
    log('Root path requested');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Emergency Debug Server for ALBJ Discord Bot');
    log('Root path responded with status 200');
    return;
  }
  
  // Handle debug info
  if (url === '/debug') {
    log('Debug path requested');
    
    // Get environment variables (filter out sensitive ones)
    const filteredEnv = {};
    Object.keys(process.env).forEach(key => {
      if (!key.includes('TOKEN') && !key.includes('SECRET') && !key.includes('KEY')) {
        filteredEnv[key] = process.env[key];
      } else {
        filteredEnv[key] = '[FILTERED]';
      }
    });
    
    // Get system info
    const systemInfo = {
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname(),
      arch: os.arch(),
      cpus: os.cpus().length,
      freemem: Math.round(os.freemem() / 1024 / 1024) + 'MB',
      totalmem: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
      uptime: os.uptime()
    };
    
    // Get process info
    const processInfo = {
      pid: process.pid,
      ppid: process.ppid,
      version: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
    
    // Return debug info
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      timestamp: new Date().toISOString(),
      environment: filteredEnv,
      system: systemInfo,
      process: processInfo
    }, null, 2));
    log('Debug path responded with status 200');
    return;
  }
  
  // Handle 404
  log(`Unknown path requested: ${url}`);
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Error handling for the server
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  
  // Try another port if this one is in use
  if (err.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    log(`Port ${PORT} in use, trying port ${newPort}`);
    setTimeout(() => {
      server.listen(newPort, '0.0.0.0');
    }, 1000);
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  log(`Emergency debug server running on port ${PORT}`);
});

// Handle process signals
process.on('SIGINT', () => {
  log('SIGINT received, shutting down');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down');
  server.close();
  process.exit(0);
});

// Keep process alive
setInterval(() => {
  log('Server heartbeat');
}, 60000);

log('Emergency debug server initialized'); 