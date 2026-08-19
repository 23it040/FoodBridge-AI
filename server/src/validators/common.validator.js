import Joi from 'joi';

export const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().trim().default('-createdAt'),
});

export const locationSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array()
    .items(Joi.number())
    .length(2)
    .required()
    .messages({ 'array.length': 'Coordinates must be [longitude, latitude]' }),
});

export const addressSchema = Joi.object({
  street: Joi.string().trim().max(200),
  city: Joi.string().trim().max(100).required(),
  state: Joi.string().trim().max(100).required(),
  pincode: Joi.string().trim().max(10).required(),
  country: Joi.string().trim().max(100).default('India'),
});
