import ApiError from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    next(ApiError.badRequest('Validation failed', errors));
    return;
  }

  req[source] = value;
  next();
};
