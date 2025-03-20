import express from 'express';
import { getStudentSchedule, addEventToSchedule, updateEventInSchedule, deleteEventFromSchedule, addEventToStudentSchedule, getStudentScheduleById } from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

<<<<<<< HEAD
router.get('/', authMiddleware, roleMiddleware(['student']), getStudentSchedule);
router.post('/events', authMiddleware, roleMiddleware(['student']), addEventToSchedule);
router.put('/events/:eventId', authMiddleware, roleMiddleware(['student']), updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, roleMiddleware(['student']), deleteEventFromSchedule);
router.post('/:stuId', authMiddleware, roleMiddleware(['admin', 'lecturer']), addEventToStudentSchedule);
router.get('/:stuId', authMiddleware, roleMiddleware(['admin', 'lecturer']), getStudentScheduleById);
=======
router.get('/', authMiddleware, roleMiddleware(['student' , 'admin']), getStudentSchedule);
router.post('/events', authMiddleware, roleMiddleware(['student' , 'admin']), addEventToSchedule);
router.put('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), deleteEventFromSchedule);
>>>>>>> f46594cfe97c5e4ca9461bb837b9a8d71e927a3f

export default router;