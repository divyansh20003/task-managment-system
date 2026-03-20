'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Search, Filter, CheckCircle2, Circle, Clock,
  ListTodo, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, TaskStatus, Priority } from '@/types';
import { taskService } from '@/services/task.service';
import { TaskCard } from '@/components/TaskCard';
import { TaskModal } from '@/components/TaskModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';

const LIMIT = 9;

const statsConfig = [
  { key: 'total',      label: 'Total',       icon: ListTodo,    color: 'text-slate-600',  bg: 'bg-slate-100'  },
  { key: 'pending',    label: 'Pending',      icon: Circle,      color: 'text-slate-500',  bg: 'bg-slate-100'  },
  { key: 'inProgress', label: 'In Progress',  icon: Clock,       color: 'text-brand-600',  bg: 'bg-brand-100'  },
  { key: 'completed',  label: 'Completed',    icon: CheckCircle2,color: 'text-emerald-600',bg: 'bg-emerald-100'},
];

export default function DashboardPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: LIMIT, search: '', status: '', priority: '' });
  const [searchInput, setSearchInput] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = useCallback(async (f: TaskFilters) => {
    setIsLoading(true);
    try {
      const data = await taskService.getTasks(f);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [all, pending, inProgress, completed] = await Promise.all([
        taskService.getTasks({ limit: 1 }),
        taskService.getTasks({ status: 'PENDING', limit: 1 }),
        taskService.getTasks({ status: 'IN_PROGRESS', limit: 1 }),
        taskService.getTasks({ status: 'COMPLETED', limit: 1 }),
      ]);
      setStats({
        total: all.pagination.total,
        pending: pending.pagination.total,
        inProgress: inProgress.pagination.total,
        completed: completed.pagination.total,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTasks(filters); }, [filters, fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCreateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    setIsSubmitting(true);
    try {
      await taskService.createTask(data as CreateTaskInput);
      toast.success('Task created!');
      setModalOpen(false);
      fetchTasks(filters);
      fetchStats();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      toast.error(e.response?.data?.error || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      await taskService.updateTask(editingTask.id, data as UpdateTaskInput);
      toast.success('Task updated!');
      setEditingTask(null);
      fetchTasks(filters);
      fetchStats();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      toast.error(e.response?.data?.error || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await taskService.toggleTask(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      fetchStats();
      toast.success(updated.status === 'COMPLETED' ? 'Task completed!' : 'Task reopened');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deletingTaskId);
      toast.success('Task deleted');
      setDeletingTaskId(null);
      fetchTasks(filters);
      fetchStats();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, limit: LIMIT, search: '', status: '', priority: '' });
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority;

  return (
    <div className="pt-14 lg:pt-0 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {stats.total === 0
                ? 'No tasks yet. Create your first one!'
                : `You have ${stats.pending + stats.inProgress} active task${stats.pending + stats.inProgress !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="btn-primary btn-md gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {statsConfig.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 leading-none">
                    {stats[key as keyof typeof stats]}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="input pl-9 pr-9"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.status || ''}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value as TaskStatus | '', page: 1 }))}
              className="input pl-8 pr-8 w-full sm:w-40 appearance-none cursor-pointer"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.priority || ''}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value as Priority | '', page: 1 }))}
              className="input pr-8 w-full sm:w-36 appearance-none cursor-pointer"
            >
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary btn-md whitespace-nowrap">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Task list */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 h-32 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 rounded-full w-12" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <ListTodo className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Create your first task to get started.'}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-secondary btn-md mt-4">Clear filters</button>
            ) : (
              <button onClick={() => { setEditingTask(null); setModalOpen(true); }} className="btn-primary btn-md mt-4">
                <Plus className="w-4 h-4" /> Create task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={t => setEditingTask(t)}
                  onDelete={id => setDeletingTaskId(id)}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-slate-500">
                  Showing {(pagination.page - 1) * LIMIT + 1}–{Math.min(pagination.page * LIMIT, pagination.total)} of {pagination.total} tasks
                </p>
                <div className="flex items-center gap-2">
                  <button disabled={!pagination.hasPrev} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))} className="btn-secondary btn-sm p-2 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-700 min-w-[80px] text-center">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button disabled={!pagination.hasNext} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))} className="btn-secondary btn-sm p-2 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(modalOpen || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          isSubmitting={isSubmitting}
        />
      )}

      {deletingTaskId && (
        <ConfirmDialog
          title="Delete task"
          message="This task will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete task"
          onConfirm={handleDelete}
          onCancel={() => setDeletingTaskId(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
