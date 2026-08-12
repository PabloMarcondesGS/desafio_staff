import {
  handleAppError,
  createSuccessFeedback,
  createAlertFeedback,
  createErrorFeedback,
} from '@/lib/errorHandler';

describe('📢 Módulo de Tratamento de Erros e Feedbacks (src/lib/errorHandler.ts)', () => {
  describe('handleAppError', () => {
    it('deve extrair a mensagem de uma instância de Error', () => {
      const err = new Error('Falha no banco de dados');
      const result = handleAppError(err);

      expect(result.type).toBe('error');
      expect(result.message).toBe('Falha no banco de dados');
      expect(result.title).toBe('Erro na Operação');
    });

    it('deve extrair a mensagem quando o erro for uma string', () => {
      const result = handleAppError('Credenciais inválidas');

      expect(result.type).toBe('error');
      expect(result.message).toBe('Credenciais inválidas');
    });

    it('deve extrair a mensagem de um objeto de erro com propriedade error ou message', () => {
      const objError = { error: 'O.S. duplicada no sistema' };
      const result = handleAppError(objError);
      expect(result.message).toBe('O.S. duplicada no sistema');

      const objMessage = { message: 'Token expirado' };
      const result2 = handleAppError(objMessage);
      expect(result2.message).toBe('Token expirado');
    });

    it('deve usar a mensagem padrão quando o erro for desconhecido', () => {
      const result = handleAppError(null, 'Erro customizado');
      expect(result.message).toBe('Erro customizado');
    });
  });

  describe('Criadores de Feedback (Success, Alert, Error)', () => {
    it('deve criar feedback de sucesso com parâmetros corretos', () => {
      const feedback = createSuccessFeedback('Inspeção cadastrada!', 'Tudo certo');
      expect(feedback.type).toBe('success');
      expect(feedback.message).toBe('Inspeção cadastrada!');
      expect(feedback.title).toBe('Tudo certo');
      expect(feedback.duration).toBe(4000);
    });

    it('deve criar feedback de alerta com duração de 5000ms', () => {
      const feedback = createAlertFeedback('Verifique os itens pendentes');
      expect(feedback.type).toBe('alert');
      expect(feedback.message).toBe('Verifique os itens pendentes');
      expect(feedback.duration).toBe(5000);
    });

    it('deve criar feedback de erro com duração de 6000ms', () => {
      const feedback = createErrorFeedback('Acesso negado');
      expect(feedback.type).toBe('error');
      expect(feedback.message).toBe('Acesso negado');
      expect(feedback.duration).toBe(6000);
    });
  });
});
