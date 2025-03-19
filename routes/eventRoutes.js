import express from 'express';
import { createEvent, getEvents, markAttendance, getEventsWithAttendance, getEventAttendanceAnalytics, getEventByTitle } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createEvent);
router.get('/', authMiddleware, getEvents);
router.get('/with-attendance', authMiddleware, roleMiddleware(['admin']), getEventsWithAttendance);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getEventAttendanceAnalytics);
router.get('/name/:eventTitle', authMiddleware, roleMiddleware(['student', 'lecturer', 'admin']), getEventByTitle);
router.post('/:eventId/attend', authMiddleware, roleMiddleware(['student']), markAttendance);

export default router;