import express from 'express';
import { getStudentSchedule, addEventToSchedule, updateEventInSchedule, deleteEventFromSchedule, addEventToStudentSchedule, getStudentScheduleById, addEventToScheduleByAdmin, getStudentScheduleByAdmin, deleteEventFromScheduleByAdmin, deleteEventFromScheduleCompletely } from '../controllers/scheduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();





router.post('/:stuId', authMiddleware, roleMiddleware(['admin', 'lecturer']), addEventToStudentSchedule);
router.get('/:stuId', authMiddleware, roleMiddleware(['admin', 'lecturer']), getStudentScheduleById);


router.get('/', authMiddleware, roleMiddleware(['student']), getStudentSchedule);

router.get('/event', authMiddleware, roleMiddleware(['admin']), getStudentScheduleByAdmin);
router.post('/', authMiddleware, roleMiddleware(['student' , 'admin']), addEventToSchedule);
router.post('/event', authMiddleware, roleMiddleware(['admin']), addEventToScheduleByAdmin);
router.put('/events/:eventId', authMiddleware, roleMiddleware(['student' , 'admin']), updateEventInSchedule);
router.delete('/events/:eventId', authMiddleware, roleMiddleware(['student']), deleteEventFromSchedule);
router.delete('/events/complete/:eventId', authMiddleware, roleMiddleware([ 'admin']), deleteEventFromScheduleCompletely);
router.delete('/events/event/:studentId/:eventId', authMiddleware, roleMiddleware(['admin']), deleteEventFromScheduleByAdmin);


export default router;