import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  updateProfileSchema,
  updateVerificationSchema,
  listUsersSchema,
  userIdParamSchema,
} from '../validators/user.validator.js';
import { USER_ROLES } from '../constants/enums.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post(
  '/profile/avatar',
  uploadLimiter,
  uploadSingle('avatar'),
  userController.uploadAvatar
);
router.post(
  '/profile/documents',
  uploadLimiter,
  uploadSingle('document'),
  userController.uploadDocument
);

router.get(
  '/',
  authorize(USER_ROLES.ADMIN),
  validate(listUsersSchema, 'query'),
  userController.listUsers
);

router.get(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  userController.getUserById
);

router.patch(
  '/:id/verification',
  authorize(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  validate(updateVerificationSchema),
  userController.updateVerificationStatus
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validate(userIdParamSchema, 'params'),
  userController.deactivateUser
);

export default router;
