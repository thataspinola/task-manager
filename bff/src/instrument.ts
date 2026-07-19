/**
 * Deve ser o primeiro import do main (padrão Sentry NestJS).
 * Inicializa o SDK antes de carregar o Nest, para instrumentação automática.
 */
import { initSentry } from './observability/sentry.js';

initSentry();
