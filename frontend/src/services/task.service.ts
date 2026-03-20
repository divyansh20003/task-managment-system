import { api } from '@/lib/api';
import {
  Task,
  TasksResponse,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const { data } = await api.get<TasksResponse>(`/tasks?${params.toString()}`);
    return data;
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await api.get<{ task: Task }>(`/tasks/${id}`);
    return data.task;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const { data } = await api.post<{ task: Task }>('/tasks', input);
    return data.task;
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await api.patch<{ task: Task }>(`/tasks/${id}`, input);
    return data.task;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async toggleTask(id: string): Promise<Task> {
    const { data } = await api.patch<{ task: Task }>(`/tasks/${id}/toggle`);
    return data.task;
  },
};
