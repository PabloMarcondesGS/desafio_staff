'use client';

import React from 'react';
import { FeedbackMessage, FeedbackType } from '@/lib/errorHandler';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface FeedbackToastProps {
  feedback: FeedbackMessage;
  onClose: () => void;
}

export default function FeedbackToast({ feedback, onClose }: FeedbackToastProps) {
  const getConfig = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-emerald-900 text-white',
          borderColor: 'border-emerald-500',
          textColor: 'text-emerald-100',
          iconColor: 'text-emerald-300',
          defaultTitle: 'Sucesso',
        };
      case 'alert':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-900 text-white',
          borderColor: 'border-amber-500',
          textColor: 'text-amber-100',
          iconColor: 'text-amber-300',
          defaultTitle: 'Atenção / Alerta',
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-900 text-white',
          borderColor: 'border-red-500',
          textColor: 'text-red-100',
          iconColor: 'text-red-300',
          defaultTitle: 'Erro',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-slate-900 text-white',
          borderColor: 'border-sky-500',
          textColor: 'text-slate-100',
          iconColor: 'text-sky-300',
          defaultTitle: 'Informação',
        };
    }
  };

  const config = getConfig(feedback.type);
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-2xl border-2 shadow-2xl transition-all duration-200 transform translate-y-0 opacity-100 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-3 p-4 flex-1">
        <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            {feedback.title || config.defaultTitle}
          </h4>
          <p className={`mt-1 text-xs font-medium leading-relaxed ${config.textColor}`}>
            {feedback.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white p-1 rounded-lg transition shrink-0 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
