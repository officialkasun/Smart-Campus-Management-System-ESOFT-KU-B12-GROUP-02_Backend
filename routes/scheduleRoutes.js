import express from 'express';
import { getStudentSchedule, addEventToSchedule, updateEventInSchedule, deleteEventFromSchedule } from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['student' , 'admin']), getStudentSchedule);
router.post('/events', authMiddleware, roleMiddleware(['student' , 'admin']), addEventToSchedule);
router.put('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), deleteEventFromSchedule);

export default router;