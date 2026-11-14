import { Router } from 'express';
import {
  getRoutingMatrix,
  simulateDispatch,
  getRoutingQueues
} from '../controllers/routingController.js';

const router = Router();

router.get('/', getRoutingMatrix);
router.post('/dispatch', simulateDispatch);
router.get('/queue', getRoutingQueues);

export default router;
