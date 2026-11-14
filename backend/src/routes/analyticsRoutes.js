import { Router } from 'express';
import {
  getSummaryAnalytics,
  getCategoryAnalytics,
  getZoneAnalytics,
  getDailyAnalytics,
  getHandlerWorkloadAnalytics
} from '../controllers/analyticsController.js';

const router = Router();

router.get('/summary', getSummaryAnalytics);
router.get('/categories', getCategoryAnalytics);
router.get('/zones', getZoneAnalytics);
router.get('/daily', getDailyAnalytics);
router.get('/workload', getHandlerWorkloadAnalytics);

export default router;
