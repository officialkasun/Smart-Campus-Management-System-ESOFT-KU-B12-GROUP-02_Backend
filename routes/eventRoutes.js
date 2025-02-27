import express from 'express';
import { createEvent, getEvents, markAttendance } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createEvent);
router.get('/', authMiddleware, getEvents);
router.post('/:eventId/attend', authMiddleware, markAttendance);

export default router;