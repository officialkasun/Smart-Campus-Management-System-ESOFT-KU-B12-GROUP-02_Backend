import express from 'express';
import { createEvent, getEvents, markAttendance, getEventsWithAttendance, getEventAttendanceAnalytics, getEventByTitle, deleteEvent, updateEvent, deleteAttendee, assignBulkStudentsToEvent } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createEvent);
router.get('/', authMiddleware, getEvents);
router.get('/with-attendance', authMiddleware, roleMiddleware(['admin', 'lecturer']), getEventsWithAttendance);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getEventAttendanceAnalytics);
router.get('/name/:eventTitle', authMiddleware, roleMiddleware(['student', 'lecturer', 'admin']), getEventByTitle);
router.post('/:eventId/attend', authMiddleware, roleMiddleware(['student']), markAttendance);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'lecturer']), deleteEvent);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'lecturer']), updateEvent);
router.delete('/:eventId/:attendeeId', authMiddleware, roleMiddleware(['admin', 'lecturer']), deleteAttendee);
router.post('/:eventId/bulk', authMiddleware, roleMiddleware(['admin', 'lecturer']), assignBulkStudentsToEvent);

export default router;