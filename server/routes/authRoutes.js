import express from 'express';
import { register, login, getProfile, checkId } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check-id', checkId);
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getProfile);

export default router;
