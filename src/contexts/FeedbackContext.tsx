'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FeedbackMessage, FeedbackType, handleAppError } from '@/lib/errorHandler';
import FeedbackToast from '@/components/ui/FeedbackToast';

interface FeedbackContextType {
  showFeedback: (message: string | unknown, type?: FeedbackType, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showAlert: (message: string, title?: string) => void;
  showError: (error: unknown, defaultMessage?: string, title?: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType>({} as FeedbackContextType);

export const FeedbackProvider = ({ children }: { children: React.ReactNode }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showFeedback = useCallback(
    (messageOrError: string | unknown, type: FeedbackType = 'info', title?: string) => {
      let finalMessage = '';
      let finalType = type;

      if (type === 'error' && typeof messageOrError !== 'string') {
        const errorObj = handleAppError(messageOrError);
        finalMessage = errorObj.message;
      } else if (typeof messageOrError === 'string') {
        finalMessage = messageOrError;
      } else {
        try {
          finalMessage = JSON.stringify(messageOrError);
        } catch {
          finalMessage = String(messageOrError);
        }
      }

      console.log(`[FixCar Feedback - ${finalType.toUpperCase()}]:`, finalMessage);

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newFeedback: FeedbackMessage = {
        id,
        message: finalMessage,
        type: finalType,
        title,
        duration: finalType === 'error' ? 8000 : finalType === 'alert' ? 6000 : 4000,
      };

      setFeedbacks((prev) => [...prev, newFeedback]);

      setTimeout(() => {
        removeFeedback(id);
      }, newFeedback.duration);
    },
    [removeFeedback]
  );

  const showSuccess = useCallback(
    (message: string, title = 'Sucesso!') => {
      showFeedback(message, 'success', title);
    },
    [showFeedback]
  );

  const showAlert = useCallback(
    (message: string, title = 'Atenção!') => {
      showFeedback(message, 'alert', title);
    },
    [showFeedback]
  );

  const showError = useCallback(
    (error: unknown, defaultMessage = 'Ocorreu um erro ao processar a solicitação', title = 'Erro!') => {
      if (typeof error === 'string') {
        showFeedback(error, 'error', title);
      } else {
        const err = handleAppError(error, defaultMessage);
        showFeedback(err.message, 'error', title);
      }
    },
    [showFeedback]
  );

  const toastContainer = mounted ? (
    <div
      style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 999999 }}
      className="flex flex-col gap-3 pointer-events-none max-w-sm w-full"
    >
      {feedbacks.map((fb) => (
        <FeedbackToast
          key={fb.id}
          feedback={fb}
          onClose={() => fb.id && removeFeedback(fb.id)}
        />
      ))}
    </div>
  ) : null;

  return (
    <FeedbackContext.Provider value={{ showFeedback, showSuccess, showAlert, showError }}>
      {children}
      {mounted && typeof document !== 'undefined'
        ? createPortal(toastContainer, document.body)
        : null}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
