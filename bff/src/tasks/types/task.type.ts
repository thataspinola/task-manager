export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedTasks = {
  data: Task[];
  meta: PaginationMeta;
};
