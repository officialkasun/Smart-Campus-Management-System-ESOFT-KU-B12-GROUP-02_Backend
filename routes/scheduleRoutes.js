import express from 'express';
import { getStudentSchedule, addEventToSchedule, updateEventInSchedule, deleteEventFromSchedule, addEventToStudentSchedule, getStudentScheduleById, addEventToScheduleByAdmin, getStudentScheduleByAdmin } from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['student']), getStudentSchedule);

router.get('/event', authMiddleware, roleMiddleware(['student' , 'admin']), getStudentScheduleByAdmin);
router.post('/', authMiddleware, roleMiddleware(['student' , 'admin']), addEventToSchedule);
router.post('/event', authMiddleware, roleMiddleware(['admin']), addEventToScheduleByAdmin);
router.put('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), deleteEventFromSchedule);

export default router;