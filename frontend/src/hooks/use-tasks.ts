/**
 * Hooks TanStack Query — ponte entre a UI e `tasks-api`.
 * Invalidação e captura de erro centralizadas (DRY + observabilidade).
 */
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from '../api/tasks-api';
import { captureClientException } from '../observability/sentry';
import type {
  CreateTaskInput,
  ListTasksParams,
  UpdateTaskInput,
} from '../types/task';

export const taskQueryKeys = {
  all: ['tasks'] as const,

  list: (params: ListTasksParams) =>
    [...taskQueryKeys.all, 'list', params] as const,
};

async function invalidateTaskQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: taskQueryKeys.all,
  });
}

function reportMutationError(error: unknown): void {
  captureClientException(error);
}

export function useTasks(params: ListTasksParams) {
  return useQuery({
    queryKey: taskQueryKeys.list(params),
    queryFn: () => listTasks(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    },
    onError: reportMutationError,
  });
}

type UpdateTaskVariables = {
  id: string;
  input: UpdateTaskInput;
};

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTaskVariables) => updateTask(id, input),
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    },
    onError: reportMutationError,
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    },
    onError: reportMutationError,
  });
}
