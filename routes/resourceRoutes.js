import express from 'express';
import { reserveResource } from '../controllers/resourceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/reserve', authMiddleware, reserveResource);

export default router;