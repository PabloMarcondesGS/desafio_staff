'use client';

import React from 'react';
import { Fuel, Zap } from 'lucide-react';

interface FuelGaugeProps {
  value: number; // 0, 0.25, 0.5, 0.75, 1.0
  onChange?: (val: number) => void;
  batteryPercent?: number | null;
  onBatteryChange?: (val: number | null) => void;
  readOnly?: boolean;
}

export default function FuelGauge({
  value,
  onChange,
  batteryPercent,
  onBatteryChange,
  readOnly = false,
}: FuelGaugeProps) {
  // Ângulos do ponteiro: 0 -> -90 deg, 0.25 -> -45 deg, 0.5 -> 0 deg, 0.75 -> 45 deg, 1.0 -> 90 deg
  const needleAngle = -90 + value * 180;

  const levels = [
    { val: 0, label: '0' },
    { val: 0.25, label: '1/4' },
    { val: 0.5, label: '1/2' },
    { val: 0.75, label: '3/4' },
    { val: 1.0, label: '1' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 w-full overflow-hidden">
      {/* Combustível Analógico */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5 text-center">
          <Fuel className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          Nível de Combustível
        </span>

        <div className="relative w-40 h-20 flex items-center justify-center">
          {/* Arco do Medidor */}
          <svg viewBox="0 0 160 90" className="w-full h-full overflow-visible">
            {/* Faixa Vermelha de Reserva */}
            <path
              d="M 20 80 A 60 60 0 0 1 45 40"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Faixa Normal */}
            <path
              d="M 45 40 A 60 60 0 0 1 140 80"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Marcadores de Texto */}
            <text x="12" y="85" fontSize="10" fontWeight="bold" fill="#64748b">0</text>
            <text x="35" y="32" fontSize="10" fontWeight="bold" fill="#64748b">1/4</text>
            <text x="73" y="14" fontSize="10" fontWeight="bold" fill="#64748b">1/2</text>
            <text x="115" y="32" fontSize="10" fontWeight="bold" fill="#64748b">3/4</text>
            <text x="142" y="85" fontSize="10" fontWeight="bold" fill="#64748b">1</text>

            {/* Ícone de Bomba Central */}
            <g transform="translate(73, 50) scale(0.6)">
              <path d="M4 22V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5M4 9h10" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </g>

            {/* Ponteiro */}
            <g transform="translate(80, 78)">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-50"
                stroke="#dc2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${needleAngle})`}
                className="transition-transform duration-300 ease-out"
              />
              <circle cx="0" cy="0" r="5" fill="#1e293b" />
            </g>
          </svg>
        </div>

        {/* Botões de Seleção Rápida */}
        {!readOnly && onChange && (
          <div className="flex gap-1 mt-1.5">
            {levels.map((lvl) => (
              <button
                key={lvl.val}
                type="button"
                onClick={() => onChange(lvl.val)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                  value === lvl.val
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divisor Visual */}
      <div className="hidden sm:block w-px h-24 bg-slate-200 self-center" />

      {/* Bateria LEV (Híbrido/Elétrico) */}
      <div className="flex flex-col items-center shrink-0 max-w-[180px] text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-center gap-1 leading-tight">
          <Zap className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          % Bateria LEV
          <span className="block text-[9px] font-medium text-slate-500 normal-case">(Híbrido / Elétrico)</span>
        </span>

        <div className="flex items-center justify-center gap-2">
          <div className="w-16 h-7 border-2 border-slate-400 rounded p-0.5 relative flex items-center bg-white shadow-inner">
            <div
              className="h-full bg-emerald-500 rounded-xs transition-all duration-300"
              style={{ width: `${batteryPercent ?? 0}%` }}
            />
            <div className="w-1 h-3 bg-slate-400 absolute -right-1.5 top-1/2 -translate-y-1/2 rounded-r-xs" />
          </div>
          <span className="text-xs font-black text-slate-800 w-10 text-left">
            {batteryPercent !== null && batteryPercent !== undefined ? `${batteryPercent}%` : '--'}
          </span>
        </div>

        {!readOnly && onBatteryChange && (
          <div className="mt-1.5 flex flex-col items-center gap-1 w-full">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={batteryPercent ?? 0}
              onChange={(e) => onBatteryChange(Number(e.target.value))}
              className="w-28 accent-emerald-500 cursor-pointer h-1.5"
            />
            <div className="flex gap-2 text-[9px]">
              <button
                type="button"
                onClick={() => onBatteryChange(null)}
                className="text-slate-400 hover:text-slate-700 underline"
              >
                Limpar (N/A)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
