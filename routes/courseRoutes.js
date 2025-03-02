import express from 'express';
import upload from '../utils/multerConfig.js';
import { getCourses, registerForCourse, getStudentSchedule, createCourse, getCourseById, getLectureMaterial } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCourses);
router.post('/register', authMiddleware, registerForCourse);
router.get('/schedule', authMiddleware, getStudentSchedule);
router.post('/', upload.array('lectureMaterials', 5), createCourse);
router.get('/:courseId', authMiddleware, getCourseById);
router.get('/:courseId/lecture/:filename', authMiddleware, getLectureMaterial);

export default router;