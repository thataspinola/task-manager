import { resolveBffBaseUrl, createHttpClient } from './http-client';

describe('http-client', () => {
  it('resolveBffBaseUrl returns trimmed URL', () => {
    expect(resolveBffBaseUrl('  http://localhost:3002/api  ')).toBe(
      'http://localhost:3002/api',
    );
  });

  it('resolveBffBaseUrl uses env when omitted', () => {
    expect(resolveBffBaseUrl()).toBe('http://localhost:3002/api');
  });

  it('resolveBffBaseUrl rejects non-string values', () => {
    expect(() => resolveBffBaseUrl(null as unknown as string)).toThrow(
      'VITE_BFF_BASE_URL is not defined',
    );
  });

  it('resolveBffBaseUrl throws when empty', () => {
    expect(() => resolveBffBaseUrl('')).toThrow(
      'VITE_BFF_BASE_URL is not defined',
    );

    expect(() => resolveBffBaseUrl('   ')).toThrow(
      'VITE_BFF_BASE_URL is not defined',
    );
  });

  it('createHttpClient configures baseURL and timeout', () => {
    const client = createHttpClient('http://localhost:3002/api');

    expect(client.defaults.baseURL).toBe('http://localhost:3002/api');
    expect(client.defaults.timeout).toBe(10_000);
  });

  it('createHttpClient uses env base URL by default', () => {
    const client = createHttpClient();

    expect(client.defaults.baseURL).toBe('http://localhost:3002/api');
  });
});
