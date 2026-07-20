/**
 * Extensões do Vitest/jest-dom (ex.: toBeInTheDocument) para os specs.
 * Com `globals: true`, o `expect` global pode ser outra instância do importado —
 * estendemos os dois para o Vitest 4 registrar os matchers corretamente.
 */
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

const globalExpect = (
  globalThis as typeof globalThis & { expect?: typeof expect }
).expect;

if (globalExpect && globalExpect !== expect) {
  globalExpect.extend(matchers);
}
