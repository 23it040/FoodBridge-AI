import Joi from 'joi';
import {
  REQUEST_TYPES,
  REQUEST_STATUS,
  URGENCY_LEVELS,
  QUANTITY_UNITS,
} from '../constants/enums.js';
import { locationSchema, objectIdSchema, paginationSchema } from './common.validator.js';

export const createDemandRequestSchema = Joi.object({
  requestType: Joi.string().valid(REQUEST_TYPES.DEMAND).required(),
  title: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().max(1000),
  foodCategories: Joi.array().items(Joi.string().trim()).min(1).required(),
  quantityNeeded: Joi.number().min(0).required(),
  unit: Joi.string()
    .valid(...Object.values(QUANTITY_UNITS))
    .required(),
  urgency: Joi.string()
    .valid(...Object.values(URGENCY_LEVELS))
    .default(URGENCY_LEVELS.MEDIUM),
  location: locationSchema.required(),
  validUntil: Joi.date().iso().greater('now').required(),
});

export const createPickupRequestSchema = Joi.object({
  requestType: Joi.string().valid(REQUEST_TYPES.PICKUP).required(),
  donationId: objectIdSchema.required(),
  scheduledPickupAt: Joi.date().iso().greater('now'),
  description: Joi.string().trim().max(1000),
});

export const respondToRequestSchema = Joi.object({
  status: Joi.string()
    .valid(REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.REJECTED)
    .required(),
  responseNote: Joi.string().trim().max(500),
});

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const listRequestsSchema = paginationSchema.keys({
  requestType: Joi.string().valid(...Object.values(REQUEST_TYPES)),
  status: Joi.string().valid(...Object.values(REQUEST_STATUS)),
  ngoId: objectIdSchema,
  donationId: objectIdSchema,
});

export const requestIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});
