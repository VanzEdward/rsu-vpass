import express from 'express';
import { 
  getAdminStats, 
  getAllApplications, 
  reviewApplication, 
  recordPayment,
  getGuards,
  createGuard,
  updateGuard,
  deleteGuard
} from '../controllers/pasoController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

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
