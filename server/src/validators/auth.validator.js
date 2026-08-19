import Joi from 'joi';
import { USER_ROLES, DONOR_TYPES } from '../constants/enums.js';
import { addressSchema, locationSchema } from './common.validator.js';

export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string()
    .valid(USER_ROLES.DONOR, USER_ROLES.NGO, USER_ROLES.VOLUNTEER)
    .required(),
  profile: Joi.object({
    organizationName: Joi.string().trim().max(200).required(),
    contactPerson: Joi.string().trim().max(100).required(),
    phone: Joi.string().trim().max(15).required(),
    address: addressSchema.required(),
    location: locationSchema.required(),
    donorType: Joi.string().valid(...Object.values(DONOR_TYPES)),
    serviceRadiusKm: Joi.number().min(1).max(100).default(15),
    capacityPerDay: Joi.number().min(0),
    preferredFoodTypes: Joi.array().items(Joi.string().trim()),
    operatingHours: Joi.object({
      open: Joi.string().trim(),
      close: Joi.string().trim(),
    }),
  }).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});
