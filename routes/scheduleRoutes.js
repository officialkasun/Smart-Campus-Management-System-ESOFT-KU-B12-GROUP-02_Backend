import express from 'express';
import { getStudentSchedule, addEventToSchedule, updateEventInSchedule, deleteEventFromSchedule } from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['student']), getStudentSchedule);
router.post('/events', authMiddleware, roleMiddleware(['student']), addEventToSchedule);
router.put('/events/:eventId', authMiddleware, roleMiddleware(['student']), updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, roleMiddleware(['student']), deleteEventFromSchedule);

export default router;