import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FuelGauge from '@/components/inspection/FuelGauge';

describe('⛽ Componente FuelGauge (src/components/inspection/FuelGauge.tsx)', () => {
  it('deve renderizar o título do medidor de combustível e da bateria LEV', () => {
    render(<FuelGauge value={0.5} batteryPercent={80} />);

    expect(screen.getByText(/Nível de Combustível/i)).toBeInTheDocument();
    expect(screen.getByText(/% Bateria LEV/i)).toBeInTheDocument();
    expect(screen.getByText('(Híbrido / Elétrico)')).toBeInTheDocument();
  });

  it('deve exibir a porcentagem correta da bateria', () => {
    render(<FuelGauge value={0.75} batteryPercent={65} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('deve exibir "--" quando a bateria for nula ou não aplicável', () => {
    render(<FuelGauge value={1.0} batteryPercent={null} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('deve chamar onChange ao clicar nos botões de seleção rápida de combustível', () => {
    const handleChange = jest.fn();
    render(<FuelGauge value={0.5} onChange={handleChange} />);

    // Clica no botão "1/4"
    const quarterButton = screen.getByRole('button', { name: '1/4' });
    fireEvent.click(quarterButton);
    expect(handleChange).toHaveBeenCalledWith(0.25);

    // Clica no botão "1" (Cheio)
    const fullButton = screen.getByRole('button', { name: '1' });
    fireEvent.click(fullButton);
    expect(handleChange).toHaveBeenCalledWith(1.0);
  });

  it('deve chamar onBatteryChange ao clicar no botão "Limpar (N/A)"', () => {
    const handleBatteryChange = jest.fn();
    render(
      <FuelGauge
        value={0.5}
        batteryPercent={50}
        onBatteryChange={handleBatteryChange}
      />
    );

    const clearButton = screen.getByRole('button', { name: /Limpar \(N\/A\)/i });
    fireEvent.click(clearButton);
    expect(handleBatteryChange).toHaveBeenCalledWith(null);
  });

  it('não deve exibir botões de interação quando readOnly for true', () => {
    render(<FuelGauge value={0.5} batteryPercent={50} readOnly={true} />);

    expect(screen.queryByRole('button', { name: '1/4' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Limpar/i })).not.toBeInTheDocument();
  });
});
