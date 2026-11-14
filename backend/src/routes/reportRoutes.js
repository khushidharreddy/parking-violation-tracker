import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport
} from '../controllers/reportController.js';

const router = Router();

router.post('/', createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.put('/:id/status', updateReportStatus);
router.delete('/:id', deleteReport);

export default router;
