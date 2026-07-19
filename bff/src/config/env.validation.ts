/**
 * Schema Joi das variáveis do BFF.
 * Falha no boot se API_BASE_URL / FRONTEND_ORIGIN estiverem inválidos.
 */
import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  API_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  FRONTEND_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  HTTP_TIMEOUT: Joi.number().integer().min(100).max(30000).default(5000),
  SENTRY_DSN: Joi.string().uri().allow('').optional(),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
});
