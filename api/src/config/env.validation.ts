/**
 * Schema Joi das variáveis obrigatórias da API.
 * Falha cedo no boot se PORT/DATABASE_URL estiverem inválidos.
 */
import Joi from 'joi'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  // Lista separada por vírgula; vazio ou "*" libera qualquer origem (dev)
  CORS_ORIGIN: Joi.string().allow('').optional(),
})
