import express from 'express';
import { getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead } from "../controllers/notificationController.js"; // Assuming the correct path
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);
router.put('/:notificationId/read', authMiddleware, markNotificationAsRead);
router.get('/unread-count', authMiddleware, getUnreadNotificationCount);




export default router;
