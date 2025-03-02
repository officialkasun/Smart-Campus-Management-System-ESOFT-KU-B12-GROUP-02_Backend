import express from 'express';
import { getUsers, getUserById, updateUserRole, getUserActivityAnalytics } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getUserActivityAnalytics);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), updateUserRole);

export default router;