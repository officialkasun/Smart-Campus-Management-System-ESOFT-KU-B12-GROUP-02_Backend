import express from 'express';
import { createEvent, getEvents, markAttendance, getEventsWithAttendance } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createEvent);
router.get('/', authMiddleware, getEvents);
router.post('/:eventId/attend', authMiddleware, markAttendance);
router.get('/with-attendance', authMiddleware, roleMiddleware(['admin']), getEventsWithAttendance);

export default router;