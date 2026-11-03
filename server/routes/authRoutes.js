import express from 'express';
import { register, login, getProfile, checkId, updateProfile, requestPasswordReset, verifyAndResetPassword, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check-id', checkId);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/reset', verifyAndResetPassword);
router.get('/me', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
export default router;
