import express from 'express';
import upload from '../utils/multerConfig.js';
import { getCourses, registerForCourse, getStudentSchedule, createCourse, getCourseById, getLectureMaterial } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCourses);
router.get('/schedule', authMiddleware, getStudentSchedule);
router.post('/', upload.array('lectureMaterials', 5), authMiddleware, createCourse);
router.get('/:courseId', authMiddleware, getCourseById);
router.post('/:courseId/register', authMiddleware, (req, res, next) => {
    // Explicitly ignore the request body
    if (req.body && Object.keys(req.body).length > 0) {
      return res.status(400).json({ message: 'This endpoint does not accept a request body' });
    }
    next();
  }, registerForCourse);
router.get('/:courseId/lecture/:filename', authMiddleware, getLectureMaterial);

export default router;