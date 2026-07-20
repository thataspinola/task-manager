import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { TaskStatus, type Task } from '../types/task';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '9b68b301-4203-43cd-af73-9fc499804be7',
    title: 'Tarefa de teste',
    description: 'Descrição',
    status: TaskStatus.PENDING,
    createdAt: '2026-07-18T20:00:00.000Z',
    updatedAt: '2026-07-18T20:00:00.000Z',
    ...overrides,
  };
}
