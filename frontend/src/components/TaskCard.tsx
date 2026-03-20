'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Task } from '@/types';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  PENDING:     { label: 'Pending',     className: 'badge-pending',     icon: Circle       },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in-progress', icon: Clock        },
  COMPLETED:   { label: 'Completed',   className: 'badge-completed',   icon: CheckCircle2 },
};

const priorityConfig = {
  LOW:    { label: 'Low',    className: 'badge-low'    },
  MEDIUM: { label: 'Medium', className: 'badge-medium' },
  HIGH:   { label: 'High',   className: 'badge-high'   },
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;
  const isCompleted = task.status === 'COMPLETED';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className={clsx('card p-4 hover:shadow-md transition-all duration-200 group animate-fade-in', isCompleted && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={clsx(
            'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-brand-500'
          )}
        >
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={clsx('text-sm font-semibold text-slate-900 leading-snug', isCompleted && 'line-through text-slate-500')}>
              {task.title}
            </h3>
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-7 z-20 w-36 card shadow-lg overflow-hidden py-1 animate-fade-in">
                    <button onClick={() => { onEdit(task); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-2 mt-3">
            <span className={status.className}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className={priority.className}>{priority.label}</span>
            {task.dueDate && (
              <span className={clsx('badge', isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500')}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
