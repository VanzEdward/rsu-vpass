import express from 'express';
import { getMyVehicles, registerVehicle, getMyApplications } from '../controllers/vehicleController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/my-vehicles', getMyVehicles);
router.post('/register', registerVehicle);
router.get('/my-applications', getMyApplications);

export default router;
