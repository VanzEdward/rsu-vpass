import express from 'express';
import { verifyPass, manualSearch, logVerification, getRecentLogs } from '../controllers/guardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('GUARD', 'PASO_ADMIN'));

router.post('/verify', verifyPass);
router.get('/search', manualSearch);
router.post('/log', logVerification);
router.get('/logs', getRecentLogs);

export default router;
