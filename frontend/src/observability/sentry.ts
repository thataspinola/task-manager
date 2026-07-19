/**
 * Sentry no browser (opcional).
 *
 * Sem `VITE_SENTRY_DSN` no .env → não inicializa (dev local sem conta Sentry ok).
 * Com DSN → erros do cliente podem ir para o painel do Sentry.
 */
import * as Sentry from '@sentry/react';

export function readDsn(
  value: string | undefined = import.meta.env.VITE_SENTRY_DSN,
): string {
  return (value ?? '').trim();
}

/** Percentual de traces (0–1). Inválido → 0.1 (10%). */
export function resolveTracesSampleRate(value?: string): number {
  const raw =
    value === undefined
      ? import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
      : value;
  const sampleRate = Number(raw);
  return Number.isFinite(sampleRate) ? sampleRate : 0.1;
}

export function resolveEnvironment(value?: string): string {
  const mode = value === undefined ? import.meta.env.MODE : value;
  return mode || 'development';
}

/** @returns true se o Sentry foi ligado */
export function initSentry(): boolean {
  const dsn = readDsn();
  if (!dsn) {
    return false;
  }

  Sentry.init({
    dsn,
    environment: resolveEnvironment(),
    tracesSampleRate: resolveTracesSampleRate(),
  });

  return true;
}

/** Envia exceção manualmente (só se houver DSN) */
export function captureClientException(exception: unknown): void {
  if (!readDsn()) {
    return;
  }

  Sentry.captureException(exception);
}
