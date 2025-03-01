import express from 'express';
import { getStudentSchedule, addEventToSchedule, updateEventInSchedule, deleteEventFromSchedule } from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getStudentSchedule);
router.post('/events', authMiddleware, addEventToSchedule);
router.put('/events/:eventId', authMiddleware, updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, deleteEventFromSchedule);

export default router;