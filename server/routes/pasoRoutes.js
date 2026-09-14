import express from 'express';
import { getAdminStats, getAllApplications, reviewApplication, recordPayment } from '../controllers/pasoController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('PASO_ADMIN'));

router.get('/stats', getAdminStats);
router.get('/applications', getAllApplications);
router.patch('/applications/:applicationId/review', reviewApplication);
router.post('/payments/record', recordPayment);

export default router;
