import * as Sentry from '@sentry/react';
import {
  captureClientException,
  initSentry,
  readDsn,
  resolveEnvironment,
  resolveTracesSampleRate,
} from './sentry';

describe('sentry', () => {
  const originalDsn = import.meta.env.VITE_SENTRY_DSN;
  const originalRate = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE;

  afterEach(() => {
    import.meta.env.VITE_SENTRY_DSN = originalDsn;
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE = originalRate;
    vi.clearAllMocks();
  });

  it('readDsn trims and falls back', () => {
    expect(readDsn('  https://x  ')).toBe('https://x');
    expect(readDsn(undefined)).toBe('');
    expect(readDsn(null as unknown as string)).toBe('');
  });

  it('resolveTracesSampleRate handles defaults and invalid values', () => {
    expect(resolveTracesSampleRate('0.5')).toBe(0.5);
    expect(resolveTracesSampleRate('abc')).toBe(0.1);
    expect(resolveTracesSampleRate()).toBeTypeOf('number');
  });

  it('resolveEnvironment falls back to development', () => {
    expect(resolveEnvironment('production')).toBe('production');
    expect(resolveEnvironment('')).toBe('development');
    expect(resolveEnvironment()).toBeTruthy();
  });

  it('does not init without DSN', () => {
    import.meta.env.VITE_SENTRY_DSN = '';

    expect(initSentry()).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('inits with DSN', () => {
    import.meta.env.VITE_SENTRY_DSN = 'https://example@o0.ingest.sentry.io/1';
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE = '0.2';

    expect(initSentry()).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://example@o0.ingest.sentry.io/1',
        tracesSampleRate: 0.2,
      }),
    );
  });

  it('captureClientException is a no-op without DSN', () => {
    import.meta.env.VITE_SENTRY_DSN = '';

    captureClientException(new Error('x'));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('captureClientException forwards with DSN', () => {
    import.meta.env.VITE_SENTRY_DSN = 'https://example@o0.ingest.sentry.io/1';
    const error = new Error('boom');

    captureClientException(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
