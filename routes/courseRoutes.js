import express from 'express';
import upload from '../utils/multerConfig.js';
import { getCourses, registerForCourse, getStudentSchedule, createCourse, getCourseById, getLectureMaterials, deleteCourse } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCourses);
router.get('/schedule', authMiddleware, getStudentSchedule);
// Create a new course with file uploade
router.post(
  '/',
  (req, res, next) => {
    upload.array('lectureMaterials', 5)(req, res, (err) => {
      if (err) {
        if (err.message === 'File format is not supported. Only PDF, DOC, PPT, and TXT files are allowed.') {
          return res.status(400).json({ message: err.message });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size exceeds the limit of 5MB.' });
        }
        console.log(err);
        return res.status(400).json({ message: 'File upload failed. Please check the file format and size.' });
      }
      next();
    });
  },
  authMiddleware,
  roleMiddleware(['lecturer']),
  createCourse
);

router.get('/:courseId', authMiddleware, roleMiddleware(['admin']), getCourseById);
router.post('/:courseId/register', authMiddleware, (req, res, next) => {
    // Explicitly ignore the request body
    if (req.body && Object.keys(req.body).length > 0) {
      return res.status(400).json({ message: 'This endpoint does not accept a request body' });
    }
    next();
  }, registerForCourse);
router.get('/:courseId/materials', authMiddleware, getLectureMaterials);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'lecturer']), deleteCourse);


export default router;