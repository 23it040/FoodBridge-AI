import Joi from 'joi';
import { objectIdSchema, paginationSchema } from './common.validator.js';

export const createReviewSchema = Joi.object({
  donationId: objectIdSchema.required(),
  foodRequestId: objectIdSchema.required(),
  revieweeId: objectIdSchema.required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000),
  tags: Joi.array().items(Joi.string().trim().max(50)),
});

export const listReviewsSchema = paginationSchema.keys({
  revieweeId: objectIdSchema,
  donationId: objectIdSchema,
});

export const reviewIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});
