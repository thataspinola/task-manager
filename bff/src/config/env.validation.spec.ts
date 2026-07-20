/// <reference types="jest" />

import Joi from 'joi';
import {
  envValidationSchema,
  validateFrontendOrigin,
} from './env.validation.js';

type ValidatedEnv = {
  API_BASE_URL: string;
  FRONTEND_ORIGIN: string;
  PORT: number;
  HTTP_TIMEOUT: number;
  NODE_ENV: string;
};

describe('validateFrontendOrigin', () => {
  const helpers = {
    error: jest.fn((code: string) => ({ code })),
  } as unknown as Joi.CustomHelpers;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects non-string values', () => {
    const result = validateFrontendOrigin(42, helpers);

    expect(helpers.error).toHaveBeenCalledWith('any.invalid');
    expect(result).toEqual({ code: 'any.invalid' });
  });

  it('rejects invalid origin strings', () => {
    const result = validateFrontendOrigin('not-a-url', helpers);

    expect(helpers.error).toHaveBeenCalledWith('any.invalid');
    expect(result).toEqual({ code: 'any.invalid' });
  });

  it('returns a valid origin string', () => {
    const origin = 'http://localhost:5173';

    expect(validateFrontendOrigin(origin, helpers)).toBe(origin);
    expect(helpers.error).not.toHaveBeenCalled();
  });
});

describe('envValidationSchema', () => {
  const validEnv = {
    API_BASE_URL: 'http://localhost:3001/api',
    FRONTEND_ORIGIN: 'http://localhost:5173',
  };

  it('accepts a minimal valid env and applies defaults', () => {
    const result = envValidationSchema.validate(validEnv);
    const value = result.value as ValidatedEnv;

    expect(result.error).toBeUndefined();
    expect(value.PORT).toBe(3002);
    expect(value.HTTP_TIMEOUT).toBe(5000);
    expect(value.NODE_ENV).toBe('development');
  });

  it('accepts custom PORT and NODE_ENV', () => {
    const result = envValidationSchema.validate({
      ...validEnv,
      PORT: 4000,
      NODE_ENV: 'test',
      HTTP_TIMEOUT: 1000,
    });
    const value = result.value as ValidatedEnv;

    expect(result.error).toBeUndefined();
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

  it('accepts multiple comma-separated FRONTEND_ORIGIN values', () => {
    const result = envValidationSchema.validate({
      ...validEnv,
      FRONTEND_ORIGIN: 'http://localhost:5173,http://localhost:4173',
    });
    const value = result.value as ValidatedEnv;

    expect(result.error).toBeUndefined();
    expect(value.FRONTEND_ORIGIN).toContain('4173');
  });
});
