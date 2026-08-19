import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  listNotificationsSchema,
  notificationIdParamSchema,
} from '../validators/notification.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listNotificationsSchema, 'query'), notificationController.listNotifications);
router.patch(
  '/read-all',
  notificationController.markAllAsRead
);
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  notificationController.markAsRead
);
router.delete(
  '/:id',
  validate(notificationIdParamSchema, 'params'),
  notificationController.deleteNotification
);

export default router;
