/**
 * Entrypoint do BFF.
 * Em Jest (`JEST_WORKER_ID`) o servidor não sobe automaticamente.
 */
import { bootstrap } from './bootstrap/create-app.js';

if (!process.env.JEST_WORKER_ID) {
  void bootstrap();
}
