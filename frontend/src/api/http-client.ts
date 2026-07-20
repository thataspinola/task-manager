/**
 * Cliente HTTP Axios apontando para o BFF.
 *
 * Regra do monorepo: o browser NUNCA chama a API (:3001) direto —
 * só o BFF (:3002/api), via VITE_BFF_BASE_URL no .env.
 */
import axios, { type AxiosInstance } from 'axios';

/** Lê e valida a URL do BFF (obrigatória em runtime) */
export function resolveBffBaseUrl(value?: string): string {
  const raw = value === undefined ? import.meta.env.VITE_BFF_BASE_URL : value;
  const baseURL = typeof raw === 'string' ? raw.trim() : '';

  if (!baseURL) {
    throw new Error('VITE_BFF_BASE_URL is not defined');
  }

  return baseURL;
}

/** Cria uma instância Axios já configurada (timeout + JSON) */
export function createHttpClient(baseURL = resolveBffBaseUrl()): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

/** Instância única usada por toda a camada `api/` */
export const httpClient = createHttpClient();
