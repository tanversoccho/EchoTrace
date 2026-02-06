const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tors', require('./routes/tors'));
app.use('/api/scraping', require('./routes/scraping'));
app.use('/api/export', require('./routes/export'));
app.use('/api/websites', require('./routes/websites'));

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  const token = req.url.split('token=')[1];
  
  if (!token) {
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.user = decoded;
    
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

  } catch (error) {
    ws.close();
  }
});

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'subscribe':
      ws.subscriptions = data.channels;
      break;
    case 'scraping_command':
      handleScrapingCommand(ws, data);
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
