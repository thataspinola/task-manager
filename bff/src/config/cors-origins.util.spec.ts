/// <reference types="jest" />

import { parseCorsOrigins } from './cors-origins.util.js';

describe('parseCorsOrigins', () => {
  it('parses a single origin', () => {
    expect(parseCorsOrigins('http://localhost:5173')).toEqual([
      'http://localhost:5173',
    ]);
  });

  it('parses multiple comma-separated origins', () => {
    expect(
      parseCorsOrigins(
        ' http://localhost:5173 , http://localhost:4173 ',
      ),
    ).toEqual(['http://localhost:5173', 'http://localhost:4173']);
  });

  it('rejects empty list', () => {
    expect(() => parseCorsOrigins('  ,  ')).toThrow(
      'FRONTEND_ORIGIN must contain at least one origin',
    );
  });

  it('rejects non-http(s) protocols', () => {
    expect(() => parseCorsOrigins('ftp://localhost')).toThrow(
      'Invalid frontend origin',
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => parseCorsOrigins('not-a-url')).toThrow();
  });
});
