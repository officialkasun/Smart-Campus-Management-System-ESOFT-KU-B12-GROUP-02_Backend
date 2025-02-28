import express from 'express';
import { reserveResource, addResource, getResources } from '../controllers/resourceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), addResource);
router.post('/reserve', authMiddleware, reserveResource);
router.get('/', authMiddleware, getResources);

export default router;