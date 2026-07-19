import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../api/tasks-api";
import type {
  CreateTaskInput,
  ListTasksParams,
  UpdateTaskInput,
} from "../types/task";

export const taskQueryKeys = {
  all: ["tasks"] as const,

  list: (params: ListTasksParams) =>
    [...taskQueryKeys.all, "list", params] as const,
};

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
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.all,
      });
    },
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
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.all,
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.all,
      });
    },
  });
}
