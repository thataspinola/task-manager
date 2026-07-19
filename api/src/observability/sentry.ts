/**
 * Sentry opcional: só inicializa se SENTRY_DSN estiver definido.
 */
import * as Sentry from '@sentry/nestjs'

function readDsn(): string {
  return (process.env.SENTRY_DSN ?? '').trim()
}

export function initSentry(): boolean {
  const dsn = readDsn()
  if (!dsn) {
    return false
  }

  const rawRate = process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'
  const sampleRate = Number(rawRate)
  const tracesSampleRate = Number.isFinite(sampleRate) ? sampleRate : 0.1
  const environment = process.env.NODE_ENV ?? 'development'

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,
    enableLogs: true,
  })

  return true
}

export function captureServerException(exception: unknown): void {
  if (!readDsn()) {
    return
  }

  Sentry.captureException(exception)
}
