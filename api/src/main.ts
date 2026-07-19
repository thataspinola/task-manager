import { bootstrap } from './bootstrap/create-app.js'

if (!process.env.JEST_WORKER_ID) {
  void bootstrap()
}
