/**
 * Schema Joi das variáveis do BFF.
 * FRONTEND_ORIGIN aceita uma URL ou várias separadas por vírgula (dev + preview).
 */
import Joi from 'joi';
import { parseCorsOrigins } from './cors-origins.util.js';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  API_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  FRONTEND_ORIGIN: Joi.string()
    .required()
    .custom((value: unknown, helpers) => {
      if (typeof value !== 'string') {
        return helpers.error('any.invalid');
      }
      try {
        parseCorsOrigins(value);
        return value;
      } catch {
        return helpers.error('any.invalid');
      }
    })
    .messages({
      'any.invalid':
        'FRONTEND_ORIGIN must be one or more http(s) URLs separated by commas',
    }),
  HTTP_TIMEOUT: Joi.number().integer().min(100).max(30000).default(5000),
  SENTRY_DSN: Joi.string().uri().allow('').optional(),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
});
