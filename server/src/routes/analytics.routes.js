import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { USER_ROLES } from '../constants/enums.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboard);

router.get(
  '/platform',
  authorize(USER_ROLES.ADMIN),
  analyticsController.getPlatformAnalytics
);

router.get(
  '/donor',
  authorize(USER_ROLES.DONOR),
  analyticsController.getDonorAnalytics
);

router.get(
  '/ngo',
  authorize(USER_ROLES.NGO),
  analyticsController.getNgoAnalytics
);

export default router;
