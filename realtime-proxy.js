// Simple WebSocket proxy for OpenAI Realtime API
// This allows browser to connect to Realtime API with proper authentication
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync } from 'fs';

// Load .env.local file manually
try {
  const envContent = readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
} catch (e) {
  console.warn('Could not load .env.local, using process.env');
}

const PORT = 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not found. Please set it in .env.local');
  process.exit(1);
}

console.log(`[${new Date().toISOString()}] Proxy server starting...`);
console.log(`[${new Date().toISOString()}] API key loaded: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);

const server = createServer((req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false 
});

wss.on('connection', (clientWs, req) => {
  const url = parse(req.url || '', true);
  const model = url.query.model || 'gpt-realtime-2025-08-28';
  
  console.log(`[${new Date().toISOString()}] Client connected from ${req.socket.remoteAddress}, model: ${model}`);
  
  // Connect to OpenAI Realtime API with proper headers
  const openaiUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
  console.log(`[${new Date().toISOString()}] Connecting to OpenAI Realtime API...`);
  
  const openaiWs = new WebSocket(openaiUrl, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  });
  
  // Handle connection timeout
  const connectionTimeout = setTimeout(() => {
    if (openaiWs.readyState !== WebSocket.OPEN && openaiWs.readyState !== WebSocket.CLOSED) {
      console.error(`[${new Date().toISOString()}] OpenAI connection timeout (state: ${openaiWs.readyState})`);
      openaiWs.close();
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1011, 'Connection timeout');
      }
    }
  }, 15000); // Increased timeout to 15 seconds

  // Forward messages from client to OpenAI
  clientWs.on('message', (message) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(message);
    }
  });

  // Forward messages from OpenAI to client
  openaiWs.on('message', (message) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });

  // Handle errors and close events
  openaiWs.on('error', (error) => {
    clearTimeout(connectionTimeout);
    console.error(`[${new Date().toISOString()}] OpenAI WebSocket error:`, error.message || error);
    console.error(`[${new Date().toISOString()}] Error details:`, {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close(1011, `OpenAI connection error: ${error.message || 'Unknown error'}`);
    }
  });

  clientWs.on('error', (error) => {
    clearTimeout(connectionTimeout);
    console.error(`[${new Date().toISOString()}] Client WebSocket error:`, error.message || error);
    if (openaiWs.readyState !== WebSocket.CLOSED) {
      openaiWs.close();
    }
  });

  openaiWs.on('close', (code, reason) => {
    clearTimeout(connectionTimeout);
    console.log(`[${new Date().toISOString()}] OpenAI connection closed: ${code} ${reason?.toString() || ''}`);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });
  
  clientWs.on('close', (code, reason) => {
    clearTimeout(connectionTimeout);
    console.log(`[${new Date().toISOString()}] Client connection closed: ${code} ${reason?.toString() || ''}`);
    if (openaiWs.readyState !== WebSocket.CLOSED) {
      openaiWs.close();
    }
  });

  openaiWs.on('open', () => {
    clearTimeout(connectionTimeout);
    console.log(`[${new Date().toISOString()}] ✅ Successfully connected to OpenAI Realtime API`);
    console.log(`[${new Date().toISOString()}] Ready to forward messages between client and OpenAI`);
  });
});

server.listen(PORT, () => {
  console.log(`Realtime API proxy server running on ws://localhost:${PORT}`);
  console.log('Make sure to start this proxy server before running the app');
});

