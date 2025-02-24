import express from 'express';
import { getAllUsers, getAllEvents, getAllResources } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/users', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.get('/events', authMiddleware, roleMiddleware(['admin']), getAllEvents);
router.get('/resources', authMiddleware, roleMiddleware(['admin']), getAllResources);

export default router;