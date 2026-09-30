import express from 'express';
import { 
  verifyPass, 
  manualSearch, 
  logVerification, 
  getRecentLogs,
  createTemporaryPass,
  getTemporaryPasses,
  logVisitorExitEvent,
  renewTemporaryPass
} from '../controllers/guardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('GUARD', 'PASO_ADMIN'));

router.post('/verify', verifyPass);
router.get('/search', manualSearch);
router.post('/log', logVerification);
router.get('/logs', getRecentLogs);

// Temporary Visitor Pass Management
router.post('/visitor-pass', createTemporaryPass);
router.get('/visitors', getTemporaryPasses);
router.put('/visitors/:id/exit', logVisitorExitEvent);
router.put('/visitors/:id/renew', renewTemporaryPass);

export default router;

