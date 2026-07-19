/// <reference types="jest" />

import { envValidationSchema } from './env.validation.js'

type ValidatedEnv = {
  DATABASE_URL: string
  PORT: number
  NODE_ENV: string
  CORS_ORIGIN?: string
}

describe('envValidationSchema', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/task_manager',
  }

  it('accepts a minimal valid env and applies defaults', () => {
    const result = envValidationSchema.validate(validEnv)
    const value = result.value as ValidatedEnv

    expect(result.error).toBeUndefined()
    expect(value.PORT).toBe(3001)
    expect(value.NODE_ENV).toBe('development')
  })

  it('accepts CORS_ORIGIN and a custom PORT', () => {
    const result = envValidationSchema.validate({
      ...validEnv,
      PORT: 4000,
      CORS_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    })
    const value = result.value as ValidatedEnv

    expect(result.error).toBeUndefined()
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

  it('rejects a non-postgres DATABASE_URL', () => {
    const { error } = envValidationSchema.validate({
      DATABASE_URL: 'mysql://localhost/db',
    })

    expect(error).toBeDefined()
    expect(error?.details[0]?.path).toContain('DATABASE_URL')
  })
})
