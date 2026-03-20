export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus | '';
  priority?: Priority | '';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}
