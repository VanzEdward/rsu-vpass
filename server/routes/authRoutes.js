import express from 'express';
import { register, login, getProfile, checkId, updateProfile, resetAdminProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check-id', checkId);
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/reset-admin', verifyToken, resetAdminProfile);

export default router;
