import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import Resource from './models/Resource.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);

connectDB();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);
    io.emit('receiveMessage', message); 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Cron job: Release expired resource reservations every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    const expiredResources = await Resource.find({
      availability: false,
      reservationExpiry: { $lte: now },
    });

    for (const resource of expiredResources) {
      resource.availability = true;
      resource.reservedBy = null;
      resource.reservationDate = null;
      resource.reservationExpiry = null;
      await resource.save();

      console.log(`Resource ${resource.name} is now available.`);

      io.emit('resourceUpdated', { resourceId: resource._id, name: resource.name, status: 'available' });
    }
  } catch (error) {
    console.error('Error updating expired reservations:', error);
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
