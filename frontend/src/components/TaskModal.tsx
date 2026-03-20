'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  isSubmitting: boolean;
}

export function TaskModal({ task, onClose, onSubmit, isSubmitting }: TaskModalProps) {
  const isEdit = !!task;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '' },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data: FormData) => {
    const payload: CreateTaskInput | UpdateTaskInput = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate || null,
      ...(isEdit && { status: data.status }),
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit task' : 'New task'}</h2>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="title">Title *</label>
            <input
              id="title" type="text" placeholder="What needs to be done?"
              className={`input ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" rows={3} placeholder="Add more details…" className="input resize-none" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="priority">Priority</label>
              <select id="priority" className="input" {...register('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {isEdit && (
              <div>
                <label className="label" htmlFor="status">Status</label>
                <select id="status" className="input" {...register('status')}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            )}

            <div className={isEdit ? 'col-span-2' : ''}>
              <label className="label" htmlFor="dueDate">Due date</label>
              <input id="dueDate" type="date" className="input" {...register('dueDate')} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary btn-md flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn-md flex-1">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
