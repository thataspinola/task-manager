/// <reference types="jest" />

import { envValidationSchema } from './env.validation.js';

describe('envValidationSchema', () => {
  const validEnv = {
    API_BASE_URL: 'http://localhost:3001/api',
    FRONTEND_ORIGIN: 'http://localhost:5173',
  };

  it('accepts a minimal valid env and applies defaults', () => {
    const { error, value } = envValidationSchema.validate(validEnv);

    expect(error).toBeUndefined();
    expect(value.PORT).toBe(3002);
    expect(value.HTTP_TIMEOUT).toBe(5000);
    expect(value.NODE_ENV).toBe('development');
  });

  it('accepts custom PORT and NODE_ENV', () => {
    const { error, value } = envValidationSchema.validate({
      ...validEnv,
      PORT: 4000,
      NODE_ENV: 'test',
      HTTP_TIMEOUT: 1000,
    });

    expect(error).toBeUndefined();
    expect(value.PORT).toBe(4000);
    expect(value.NODE_ENV).toBe('test');
  });

  it('rejects missing API_BASE_URL', () => {
    const { error } = envValidationSchema.validate({
      FRONTEND_ORIGIN: 'http://localhost:5173',
    });

    expect(error).toBeDefined();
  });

  it('rejects invalid FRONTEND_ORIGIN', () => {
    const { error } = envValidationSchema.validate({
      ...validEnv,
      FRONTEND_ORIGIN: 'not-a-url',
    });

    expect(error).toBeDefined();
  });
});
