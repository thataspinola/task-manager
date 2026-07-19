/**
 * Roda o sonar-scanner via Docker com o cwd absoluto (Windows/Git Bash ok).
 * Uso: na pasta api/ ou bff/, com SONAR_TOKEN no ambiente (ou via dotenv na raiz).
 */
import { spawnSync } from 'node:child_process'
import { cwd } from 'node:process'

const host =
  (process.env.SONAR_HOST_URL ?? '').trim() ||
  'http://host.docker.internal:9000'
const token = (process.env.SONAR_TOKEN ?? '').trim()

if (!token) {
  console.error('SONAR_TOKEN ausente. Defina no .env da raiz do monorepo.')
  process.exit(1)
}

const args = [
  'run',
  '--rm',
  '--add-host=host.docker.internal:host-gateway',
  '-e',
  `SONAR_HOST_URL=${host}`,
  '-e',
  `SONAR_TOKEN=${token}`,
  '-v',
  `${cwd()}:/usr/src`,
  '-w',
  '/usr/src',
  'sonarsource/sonar-scanner-cli',
]

const result = spawnSync('docker', args, { stdio: 'inherit' })
process.exit(result.status ?? 1)
