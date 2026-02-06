// backend/server.js
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

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

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});