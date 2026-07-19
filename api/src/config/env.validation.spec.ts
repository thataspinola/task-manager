/// <reference types="jest" />

import { envValidationSchema } from './env.validation.js'

describe('envValidationSchema', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/task_manager',
  }

  it('accepts a minimal valid env and applies defaults', () => {
    const { error, value } = envValidationSchema.validate(validEnv)

    expect(error).toBeUndefined()
    expect(value.PORT).toBe(3001)
    expect(value.NODE_ENV).toBe('development')
  })

  it('accepts CORS_ORIGIN and a custom PORT', () => {
    const { error, value } = envValidationSchema.validate({
      ...validEnv,
      PORT: 4000,
      CORS_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    })

    expect(error).toBeUndefined()
    expect(value.PORT).toBe(4000)
    expect(value.CORS_ORIGIN).toBe('http://localhost:5173')
    expect(value.NODE_ENV).toBe('test')
  })

  it('rejects missing DATABASE_URL', () => {
    const { error } = envValidationSchema.validate({})

    expect(error).toBeDefined()
    expect(error?.details[0]?.path).toContain('DATABASE_URL')
  })

  it('rejects an invalid PORT', () => {
    const { error } = envValidationSchema.validate({
      ...validEnv,
      PORT: 99999,
    })

    expect(error).toBeDefined()
    expect(error?.details[0]?.path).toContain('PORT')
  })
})
