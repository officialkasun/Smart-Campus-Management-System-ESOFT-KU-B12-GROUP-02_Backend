import express from 'express';
import { reserveResource, addResource, getResources, getAvailableResources, getResourceUsageAnalytics, searchResources, deleteResource } from '../controllers/resourceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), addResource);
router.get('/', authMiddleware, getResources);
router.get('/:limit/available', authMiddleware, getAvailableResources);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getResourceUsageAnalytics);
router.post('/:resId/reserve', authMiddleware, reserveResource);
router.get('/search', authMiddleware, searchResources);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteResource)

export default router;