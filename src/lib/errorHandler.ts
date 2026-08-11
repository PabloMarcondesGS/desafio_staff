export type FeedbackType = 'success' | 'alert' | 'error' | 'info';

export interface FeedbackMessage {
  id?: string;
  message: string;
  type: FeedbackType;
  title?: string;
  duration?: number; // em milissegundos
}

/**
 * Função utilitária para tratamento e padronização de erros da aplicação.
 * Extrai mensagens de erros HTTP, Zod, Prisma ou Error genérico.
 */
export function handleAppError(error: unknown, defaultMessage = 'Ocorreu um erro inesperado'): FeedbackMessage {
  let message = defaultMessage;

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object') {
    const errObj = error as Record<string, any>;
    if (errObj.error && typeof errObj.error === 'string') {
      message = errObj.error;
    } else if (errObj.message && typeof errObj.message === 'string') {
      message = errObj.message;
    }
  }

  return {
    message,
    type: 'error',
    title: 'Erro na Operação',
  };
}

/**
 * Criador de mensagens de Sucesso
 */
export function createSuccessFeedback(message: string, title = 'Sucesso!'): FeedbackMessage {
  return {
    message,
    type: 'success',
    title,
    duration: 4000,
  };
}

/**
 * Criador de mensagens de Alerta
 */
export function createAlertFeedback(message: string, title = 'Atenção!'): FeedbackMessage {
  return {
    message,
    type: 'alert',
    title,
    duration: 5000,
  };
}

/**
 * Criador de mensagens de Erro
 */
export function createErrorFeedback(message: string, title = 'Erro!'): FeedbackMessage {
  return {
    message,
    type: 'error',
    title,
    duration: 6000,
  };
}
