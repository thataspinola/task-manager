/**
 * Entrypoint da API.
 * Em Jest (`JEST_WORKER_ID`) o bootstrap não sobe o servidor automaticamente.
 */
import { bootstrap } from './bootstrap/create-app.js'

if (!process.env.JEST_WORKER_ID) {
  void bootstrap()
}
