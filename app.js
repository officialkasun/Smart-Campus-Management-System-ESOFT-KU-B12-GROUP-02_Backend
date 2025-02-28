import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import Resource from './models/Resource.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications',notificationRoutes);

// Database connection
connectDB(); 

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
      }
    } catch (error) {
      console.error('Error updating expired reservations:', error);
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));