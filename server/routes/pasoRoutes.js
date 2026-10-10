import express from 'express';
import { 
  getAdminStats, 
  getAllApplications, 
  reviewApplication, 
  recordPayment,
  getGuards,
  createGuard,
  updateGuard,
  deleteGuard,
  dispatchEmailNotification
} from '../controllers/pasoController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Notification endpoint - requires PASO Admin token in production, allows dev fallback
const permissiveAuthInDev = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader && process.env.NODE_ENV !== 'production') {
    return next();
  }
  verifyToken(req, res, () => {
    if (req.user?.role === 'PASO_ADMIN' || process.env.NODE_ENV !== 'production') {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: Requires PASO Admin authorization' });
  });
};

router.post('/notifications/send-email', permissiveAuthInDev, dispatchEmailNotification);

router.use(verifyToken);
router.use(authorizeRoles('PASO_ADMIN'));

router.get('/stats', getAdminStats);
router.get('/applications', getAllApplications);
router.patch('/applications/:applicationId/review', reviewApplication);
router.post('/payments/record', recordPayment);

// Security Guard Accounts Management (PASO Admin Only)
router.get('/guards', getGuards);
router.post('/guards', createGuard);
router.put('/guards/:guardId', updateGuard);
router.delete('/guards/:guardId', deleteGuard);

export default router;
