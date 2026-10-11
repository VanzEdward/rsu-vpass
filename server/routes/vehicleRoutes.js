import express from 'express';
import { 
  getMyVehicles, 
  registerVehicle, 
  getMyApplications, 
  submitReceipt, 
  resubmitApplication 
} from '../controllers/vehicleController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/my-vehicles', getMyVehicles);
router.post('/register', registerVehicle);
router.get('/my-applications', getMyApplications);
router.post('/applications/:applicationId/submit-receipt', submitReceipt);
router.put('/applications/:applicationId/resubmit', resubmitApplication);

export default router;
