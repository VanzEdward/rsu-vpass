import express from 'express';
import { getMyPasses, createTemporaryPass } from '../controllers/passController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/my-passes', getMyPasses);
router.post('/temporary', createTemporaryPass);

export default router;
