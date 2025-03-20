import express from 'express';
import { getUsers, getUserById, getUserByName, getStudentByName, updateUserRole, getUserActivityAnalytics, changeEmail, changePassword, deleteUser, updateUser, getInstructors, getStudents, getStudentById } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);
router.get('/lecturer', authMiddleware, roleMiddleware(['admin']), getInstructors);
router.get('/student', authMiddleware, roleMiddleware(['admin','lecturer']), getStudents);
router.get('/student/name/:name', authMiddleware, getStudentByName);
router.get('/student/:id', authMiddleware, getStudentById);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getUserActivityAnalytics);
router.get('/:id', authMiddleware, getUserById);
router.get('/name/:name', authMiddleware, getUserByName);
router.put('/change-email', authMiddleware, changeEmail);
router.put('/change-password', authMiddleware, changePassword);
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), updateUserRole);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);


export default router;