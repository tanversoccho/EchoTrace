import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { ScraperService } from './src/services/scraper.service.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Socket.IO
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000' }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Mock data
const mockTors = [
  {
    id: 1,
    source: 'World Bank',
    title: 'Education Project Consultant',
    publish_date: '2024-02-01',
    organization: 'World Bank'
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'EchoTrace Backend'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: { id: 1, email: 'admin@helios.com', name: 'Admin' }
  });
});

app.get('/api/tors', (req, res) => {
  res.json({
    tors: mockTors,
    stats: { total: 1, newToday: 0 }
  });
});

// Schedule a job to run at 2 AM every day
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled daily scrape...');
  for (const websiteKey in websiteConfigs) {
    try {
      await ScraperService.scrapeWebsite(websiteKey);
      // Add delay between sites to be polite
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Failed to scrape ${websiteKey}:`, error);
    }
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
