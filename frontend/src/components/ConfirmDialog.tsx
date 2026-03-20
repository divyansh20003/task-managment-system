'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm card p-6 shadow-2xl animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 btn-ghost btn-sm p-1.5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary btn-md flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-danger btn-md flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
