/**
 * Tipos alinhados ao contrato do BFF/API.
 *
 * `TaskStatus` é objeto `as const` + type (não `enum`) —
 * compatível com `erasableSyntaxOnly` do TypeScript 6.
 */
export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

/** Entidade completa retornada pelo BFF */
export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

/** Body do POST /tasks */
export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
};

/** Body do PATCH /tasks/:id (qualquer campo opcional) */
export type UpdateTaskInput = Partial<CreateTaskInput>;

/** Query string do GET /tasks */
export type ListTasksParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Resposta padrão da listagem */
export type PaginatedTasks = {
  data: Task[];
  meta: PaginationMeta;
};
