import Joi from 'joi';
import { FOOD_CATEGORIES, QUANTITY_UNITS, DONATION_STATUS } from '../constants/enums.js';
import { locationSchema, objectIdSchema, paginationSchema } from './common.validator.js';

const pickupWindowSchema = Joi.object({
  start: Joi.date().iso().required(),
  end: Joi.date().iso().greater(Joi.ref('start')).required(),
});

export const createDonationSchema = Joi.object({
  title: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().max(1000),
  foodType: Joi.string().trim().max(100).required(),
  category: Joi.string()
    .valid(...Object.values(FOOD_CATEGORIES))
    .required(),
  quantity: Joi.number().min(0.1).required(),
  unit: Joi.string()
    .valid(...Object.values(QUANTITY_UNITS))
    .required(),
  servingsEstimate: Joi.number().min(0),
  expiryTime: Joi.date().iso().required(),
  pickupWindow: pickupWindowSchema.required(),
  location: locationSchema.required(),
  address: Joi.string().trim().max(300),
  isPerishable: Joi.boolean().default(true),
  storageInstructions: Joi.string().trim().max(500),
});

export const updateDonationSchema = Joi.object({
  title: Joi.string().trim().max(150),
  description: Joi.string().trim().max(1000),
  foodType: Joi.string().trim().max(100),
  category: Joi.string().valid(...Object.values(FOOD_CATEGORIES)),
  quantity: Joi.number().min(0.1),
  unit: Joi.string().valid(...Object.values(QUANTITY_UNITS)),
  servingsEstimate: Joi.number().min(0),
  expiryTime: Joi.date().iso(),
  pickupWindow: pickupWindowSchema,
  location: locationSchema,
  address: Joi.string().trim().max(300),
  isPerishable: Joi.boolean(),
  storageInstructions: Joi.string().trim().max(500),
}).min(1);

export const cancelDonationSchema = Joi.object({
  cancellationReason: Joi.string().trim().max(500).required(),
});

export const listDonationsSchema = paginationSchema.keys({
  status: Joi.string().valid(...Object.values(DONATION_STATUS)),
  category: Joi.string().valid(...Object.values(FOOD_CATEGORIES)),
  donorId: objectIdSchema,
  longitude: Joi.number().min(-180).max(180),
  latitude: Joi.number().min(-90).max(90),
  radiusKm: Joi.number().min(1).max(100).default(15),
});

export const donationIdParamSchema = Joi.object({
  id: objectIdSchema.required(),
});
