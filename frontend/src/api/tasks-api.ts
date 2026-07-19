import { httpClient } from "./http-client";
import type {
  CreateTaskInput,
  ListTasksParams,
  PaginatedTasks,
  Task,
  UpdateTaskInput,
} from "../types/task";

export async function listTasks(
  params: ListTasksParams,
): Promise<PaginatedTasks> {
  const response = await httpClient.get<PaginatedTasks>("/tasks", {
    params,
  });

  return response.data;
}

export async function getTask(id: string): Promise<Task> {
  const response = await httpClient.get<Task>(`/tasks/${id}`);

  return response.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await httpClient.post<Task>("/tasks", input);

  return response.data;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await httpClient.patch<Task>(`/tasks/${id}`, input);

  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await httpClient.delete(`/tasks/${id}`);
}
