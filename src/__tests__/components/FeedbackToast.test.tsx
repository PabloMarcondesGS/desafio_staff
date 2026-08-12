import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackToast from '@/components/ui/FeedbackToast';

describe('🔔 Componente FeedbackToast (src/components/ui/FeedbackToast.tsx)', () => {
  it('deve renderizar mensagem e título de sucesso', () => {
    render(
      <FeedbackToast
        feedback={{
          id: 'toast-1',
          type: 'success',
          message: 'Vistoria salva com sucesso!',
          title: 'Sucesso',
        }}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Sucesso')).toBeInTheDocument();
    expect(screen.getByText('Vistoria salva com sucesso!')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de erro com estilo apropriado', () => {
    render(
      <FeedbackToast
        feedback={{
          id: 'toast-2',
          type: 'error',
          message: 'Falha na conexão com o servidor',
          title: 'Erro',
        }}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Falha na conexão com o servidor')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de alerta', () => {
    render(
      <FeedbackToast
        feedback={{
          id: 'toast-3',
          type: 'alert',
          message: 'Preencha todos os campos obrigatórios',
          title: 'Atenção',
        }}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('Preencha todos os campos obrigatórios')).toBeInTheDocument();
  });

  it('deve acionar a função onClose ao clicar no botão de fechar', () => {
    const handleClose = jest.fn();
    render(
      <FeedbackToast
        feedback={{
          id: 'toast-4',
          type: 'success',
          message: 'Operação finalizada',
        }}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
