/// <reference types="jest" />

jest.mock('@sentry/nestjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
}));

import * as Sentry from '@sentry/nestjs';
import { captureServerException, initSentry } from './sentry.js';

describe('sentry helpers', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('skips init when DSN is empty', () => {
    delete process.env.SENTRY_DSN;
    expect(initSentry()).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('skips init when DSN is whitespace', () => {
    process.env.SENTRY_DSN = '   ';
    expect(initSentry()).toBe(false);
  });

  it('initializes Sentry when DSN is set', () => {
    process.env.SENTRY_DSN = 'https://example@sentry.io/1';
    process.env.SENTRY_TRACES_SAMPLE_RATE = '0.2';
    process.env.NODE_ENV = 'production';
    expect(initSentry()).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: 'https://example@sentry.io/1',
      environment: 'production',
      tracesSampleRate: 0.2,
    });
  });

  it('defaults environment and sample rate', () => {
    process.env.SENTRY_DSN = 'https://example@sentry.io/1';
    delete process.env.NODE_ENV;
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
    expect(initSentry()).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'development',
        tracesSampleRate: 0.1,
      }),
    );
  });

  it('uses default sample rate when value is invalid', () => {
    process.env.SENTRY_DSN = 'https://example@sentry.io/1';
    process.env.SENTRY_TRACES_SAMPLE_RATE = 'not-a-number';
    expect(initSentry()).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        tracesSampleRate: 0.1,
      }),
    );
  });

  it('does not capture without DSN', () => {
    delete process.env.SENTRY_DSN;
    captureServerException(new Error('x'));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('captures when DSN is set', () => {
    process.env.SENTRY_DSN = 'https://example@sentry.io/1';
    const err = new Error('boom');
    captureServerException(err);
    expect(Sentry.captureException).toHaveBeenCalledWith(err);
  });
});
