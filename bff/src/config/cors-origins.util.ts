/**
 * Parseia FRONTEND_ORIGIN (uma ou várias URLs separadas por vírgula).
 */
export function parseCorsOrigins(value: string): string[] {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('FRONTEND_ORIGIN must contain at least one origin');
  }

  for (const origin of origins) {
    const url = new URL(origin);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`Invalid frontend origin: ${origin}`);
    }
  }

  return origins;
}
