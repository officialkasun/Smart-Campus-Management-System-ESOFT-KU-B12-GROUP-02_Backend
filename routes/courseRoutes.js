import express from 'express';
import { getCourses, registerForCourse, getStudentSchedule } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCourses);
router.post('/register', authMiddleware, registerForCourse);
router.get('/schedule', authMiddleware, getStudentSchedule);

export default router;