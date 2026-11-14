import { Router } from 'express';
import {
  getHandlers,
  createHandler,
  updateHandler,
  getHandlerReports
} from '../controllers/handlerController.js';

const router = Router();

router.get('/', getHandlers);
router.post('/', createHandler);
router.put('/:id', updateHandler);
router.get('/:id/reports', getHandlerReports);

export default router;
