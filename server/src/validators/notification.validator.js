import Joi from 'joi';
import { objectIdSchema, paginationSchema } from './common.validator.js';

export const listNotificationsSchema = paginationSchema.keys({
  isRead: Joi.boolean(),
  type: Joi.string().valid(
    'donation',
    'request',
    'pickup',
    'expiry',
    'review',
    'system',
    'verification'
  ),
});

export const notificationIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});
