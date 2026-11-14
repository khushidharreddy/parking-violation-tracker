import { Router } from 'express';
import { validateVehicle, validateViolation } from '../controllers/validationController.js';

const router = Router();

router.post('/vehicle', validateVehicle);
router.post('/violation', validateViolation);

export default router;
