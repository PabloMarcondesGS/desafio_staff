'use client';

import React, { useState } from 'react';
import { DamageMarkingData, DamageType, VehicleView } from '@/lib/types';
import { Plus, Trash2, X, AlertCircle, Sparkles } from 'lucide-react';

interface VehicleBlueprintProps {
  damages: DamageMarkingData[];
  onAddDamage?: (damage: DamageMarkingData) => void;
  onRemoveDamage?: (index: number) => void;
  readOnly?: boolean;
}

const DAMAGE_TYPES: { type: DamageType; label: string; short: string; color: string; bg: string; border: string; desc: string }[] = [
  { type: 'A', label: 'Amassado', short: 'A', color: '#f97316', bg: '#fff7ed', border: '#fdba74', desc: 'Amassados ou deformações na lataria' },
  { type: 'R', label: 'Riscado', short: 'R', color: '#eab308', bg: '#fefcbf', border: '#fef08a', desc: 'Riscos superficiais ou profundos na pintura' },
  { type: 'X', label: 'Quebrado', short: 'X', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', desc: 'Trincas, quebras em vidros, lanternas ou plásticos' },
  { type: 'F', label: 'Faltante', short: 'F', color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', desc: 'Peças ausentes (tampas, frisos, emblemas)' },
];

export default function VehicleBlueprint({
  damages,
  onAddDamage,
  onRemoveDamage,
  readOnly = false,
}: VehicleBlueprintProps) {
  const [selectedDamageType, setSelectedDamageType] = useState<DamageType>('A');
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCoord, setPendingCoord] = useState<{ x: number; y: number; view: VehicleView } | null>(null);
  const [damageNotes, setDamageNotes] = useState('');

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>, view: VehicleView) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setPendingCoord({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), view });
    setDamageNotes('');
    setModalOpen(true);
  };

  const handleConfirmDamage = () => {
    if (!pendingCoord || !onAddDamage) return;
    onAddDamage({
      view_type: pendingCoord.view,
      damage_type: selectedDamageType,
      coord_x: pendingCoord.x,
      coord_y: pendingCoord.y,
      notes: damageNotes.trim() || undefined,
    });
    setModalOpen(false);
    setPendingCoord(null);
  };

  const getDamageConfig = (type: DamageType) => {
    return DAMAGE_TYPES.find((d) => d.type === type) || DAMAGE_TYPES[0];
  };

  const formatViewName = (view: string) => {
    return view.replace(/_/g, ' ');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Damage Type Selector */}
      {!readOnly && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Passo 1: Selecione o tipo de avaria
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {DAMAGE_TYPES.map((item) => {
              const isSelected = selectedDamageType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedDamageType(item.type)}
                  style={{
                    borderColor: isSelected ? item.color : 'transparent',
                  }}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-800 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-sky-500 scale-[1.02]'
                      : 'bg-slate-800/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.short}
                    </span>
                    <span className="font-bold text-xs">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-normal">{item.desc}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 italic mt-1 text-center sm:text-left">
            💡 Após selecionar a avaria acima, clique em qualquer ponto nos esquemas do veículo abaixo para marcar a avaria exata.
          </p>
        </div>
      )}

      {/* Blueprint Graphical Views Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Layout Grid para as 5 vistas da carroceria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Vista Lateral Esquerda */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2.5">
              Lateral Esquerda
            </span>
            <div
              onClick={(e) => handleDiagramClick(e, 'LATERAL_ESQUERDA')}
              className="relative w-full h-32 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition duration-150 cursor-crosshair overflow-hidden flex items-center justify-center select-none shadow-xs group"
            >
              {/* Car Side Left SVG Outline */}
              <svg viewBox="0 0 400 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none group-hover:scale-[1.01] transition-transform duration-200">
                <path d="M 40 85 C 40 85 45 70 80 65 C 110 65 140 35 220 35 C 290 35 320 60 360 65 C 375 70 375 85 365 85 L 340 85 C 335 70 305 70 300 85 L 140 85 C 135 70 105 70 100 85 Z" strokeWidth="2.5" fill="#f8fafc"/>
                <circle cx="120" cy="85" r="16" strokeWidth="3" fill="#e2e8f0" />
                <circle cx="320" cy="85" r="16" strokeWidth="3" fill="#e2e8f0" />
                <path d="M 145 65 L 145 42 C 175 40 215 40 215 65 Z" strokeWidth="1.5" />
                <path d="M 225 65 L 225 40 C 265 40 285 55 305 65 Z" strokeWidth="1.5" />
                <rect x="210" y="68" width="12" height="4" rx="2" fill="#94a3b8" />
                <rect x="290" y="68" width="12" height="4" rx="2" fill="#94a3b8" />
              </svg>

              {/* Damaged Pins com Efeito de Pulsação */}
              {damages
                .filter((d) => d.view_type === 'LATERAL_ESQUERDA')
                .map((dmg, idx) => {
                  const cfg = getDamageConfig(dmg.damage_type as DamageType);
                  return (
                    <div
                      key={idx}
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                    >
                      <span className="absolute inline-flex h-6 w-6 -left-0.5 -top-0.5 rounded-full opacity-60 animate-ping" style={{ backgroundColor: cfg.color }} />
                      <div
                        style={{ backgroundColor: cfg.color }}
                        title={dmg.notes || cfg.label}
                        className="relative w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-125 transition-transform duration-150"
                      >
                        {cfg.short}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 2. Vista Lateral Direita */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2.5">
              Lateral Direita
            </span>
            <div
              onClick={(e) => handleDiagramClick(e, 'LATERAL_DIREITA')}
              className="relative w-full h-32 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition duration-150 cursor-crosshair overflow-hidden flex items-center justify-center select-none shadow-xs group"
            >
              {/* Car Side Right SVG Outline (Invertido da Esquerda) */}
              <svg viewBox="0 0 400 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none transform scale-x-[-1] group-hover:scale-x-[-1.01] group-hover:scale-y-[1.01] transition-transform duration-200">
                <path d="M 40 85 C 40 85 45 70 80 65 C 110 65 140 35 220 35 C 290 35 320 60 360 65 C 375 70 375 85 365 85 L 340 85 C 335 70 305 70 300 85 L 140 85 C 135 70 105 70 100 85 Z" strokeWidth="2.5" fill="#f8fafc"/>
                <circle cx="120" cy="85" r="16" strokeWidth="3" fill="#e2e8f0" />
                <circle cx="320" cy="85" r="16" strokeWidth="3" fill="#e2e8f0" />
                <path d="M 145 65 L 145 42 C 175 40 215 40 215 65 Z" strokeWidth="1.5" />
                <path d="M 225 65 L 225 40 C 265 40 285 55 305 65 Z" strokeWidth="1.5" />
                <rect x="210" y="68" width="12" height="4" rx="2" fill="#94a3b8" />
                <rect x="290" y="68" width="12" height="4" rx="2" fill="#94a3b8" />
              </svg>

              {damages
                .filter((d) => d.view_type === 'LATERAL_DIREITA')
                .map((dmg, idx) => {
                  const cfg = getDamageConfig(dmg.damage_type as DamageType);
                  return (
                    <div
                      key={idx}
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                    >
                      <span className="absolute inline-flex h-6 w-6 -left-0.5 -top-0.5 rounded-full opacity-60 animate-ping" style={{ backgroundColor: cfg.color }} />
                      <div
                        style={{ backgroundColor: cfg.color }}
                        title={dmg.notes || cfg.label}
                        className="relative w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-125 transition-transform duration-150"
                      >
                        {cfg.short}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 3. Vista Superior */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2.5">
              Vista Superior (Teto / Capô)
            </span>
            <div
              onClick={(e) => handleDiagramClick(e, 'SUPERIOR_TETO')}
              className="relative w-full h-40 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition duration-150 cursor-crosshair overflow-hidden flex items-center justify-center select-none shadow-xs group"
            >
              {/* Car Top View SVG */}
              <svg viewBox="0 0 360 140" className="w-full h-full p-2 text-slate-600 stroke-current fill-none group-hover:scale-[1.01] transition-transform duration-200">
                <rect x="50" y="25" width="260" height="90" rx="40" strokeWidth="2.5" fill="#f8fafc" />
                <path d="M 120 30 Q 140 70 120 110" strokeWidth="2" />
                <rect x="140" y="32" width="110" height="76" rx="10" strokeWidth="1.5" />
                <path d="M 265 32 Q 255 70 265 108" strokeWidth="2" />
                <rect x="125" y="14" width="14" height="12" rx="3" fill="#94a3b8" />
                <rect x="125" y="114" width="14" height="12" rx="3" fill="#94a3b8" />
              </svg>

              {damages
                .filter((d) => d.view_type === 'SUPERIOR_TETO')
                .map((dmg, idx) => {
                  const cfg = getDamageConfig(dmg.damage_type as DamageType);
                  return (
                    <div
                      key={idx}
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                    >
                      <span className="absolute inline-flex h-6 w-6 -left-0.5 -top-0.5 rounded-full opacity-60 animate-ping" style={{ backgroundColor: cfg.color }} />
                      <div
                        style={{ backgroundColor: cfg.color }}
                        title={dmg.notes || cfg.label}
                        className="relative w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-125 transition-transform duration-150"
                      >
                        {cfg.short}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Grid interna para Frente e Traseira de forma compacta */}
          <div className="grid grid-cols-2 gap-4 w-full">
            
            {/* 4. Vista Frontal */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2.5">
                Frente
              </span>
              <div
                onClick={(e) => handleDiagramClick(e, 'FRONTAL')}
                className="relative w-full h-40 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition duration-150 cursor-crosshair overflow-hidden flex items-center justify-center select-none shadow-xs group"
              >
                <svg viewBox="0 0 200 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none group-hover:scale-[1.01] transition-transform duration-200">
                  <path d="M 40 40 L 160 40 L 175 80 L 170 100 L 30 100 L 25 80 Z" strokeWidth="2.5" fill="#f8fafc" />
                  <rect x="50" y="45" width="100" height="25" rx="5" strokeWidth="1.5" />
                  <circle cx="45" cy="85" r="8" fill="#cbd5e1" strokeWidth="1.5" />
                  <circle cx="155" cy="85" r="8" fill="#cbd5e1" strokeWidth="1.5" />
                  <rect x="75" y="80" width="50" height="15" rx="3" fill="#cbd5e1" strokeWidth="1.5" />
                </svg>

                {damages
                  .filter((d) => d.view_type === 'FRONTAL')
                  .map((dmg, idx) => {
                    const cfg = getDamageConfig(dmg.damage_type as DamageType);
                    return (
                      <div
                        key={idx}
                        style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                      >
                        <span className="absolute inline-flex h-6 w-6 -left-0.5 -top-0.5 rounded-full opacity-60 animate-ping" style={{ backgroundColor: cfg.color }} />
                        <div
                          style={{ backgroundColor: cfg.color }}
                          title={dmg.notes || cfg.label}
                          className="relative w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-125 transition-transform duration-150"
                        >
                          {cfg.short}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 5. Vista Traseira */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2.5">
                Traseira
              </span>
              <div
                onClick={(e) => handleDiagramClick(e, 'TRASEIRA')}
                className="relative w-full h-40 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition duration-150 cursor-crosshair overflow-hidden flex items-center justify-center select-none shadow-xs group"
              >
                <svg viewBox="0 0 200 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none group-hover:scale-[1.01] transition-transform duration-200">
                  <path d="M 40 40 L 160 40 L 175 80 L 170 100 L 30 100 L 25 80 Z" strokeWidth="2.5" fill="#f8fafc" />
                  <rect x="50" y="45" width="100" height="25" rx="5" strokeWidth="1.5" />
                  <rect x="35" y="78" width="22" height="12" rx="3" fill="#f87171" strokeWidth="1.5" />
                  <rect x="143" y="78" width="22" height="12" rx="3" fill="#f87171" strokeWidth="1.5" />
                  <rect x="75" y="80" width="50" height="15" rx="3" fill="#cbd5e1" strokeWidth="1.5" />
                </svg>

                {damages
                  .filter((d) => d.view_type === 'TRASEIRA')
                  .map((dmg, idx) => {
                    const cfg = getDamageConfig(dmg.damage_type as DamageType);
                    return (
                      <div
                        key={idx}
                        style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                      >
                        <span className="absolute inline-flex h-6 w-6 -left-0.5 -top-0.5 rounded-full opacity-60 animate-ping" style={{ backgroundColor: cfg.color }} />
                        <div
                          style={{ backgroundColor: cfg.color }}
                          title={dmg.notes || cfg.label}
                          className="relative w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-125 transition-transform duration-150"
                        >
                          {cfg.short}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>

        </div>

        {/* Lista de Avarias Registradas com visual refinado */}
        {damages.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <span>Avarias Mapeadas no Carro ({damages.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {damages.map((dmg, index) => {
                const cfg = getDamageConfig(dmg.damage_type as DamageType);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs shadow-xs hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-xs"
                        style={{ backgroundColor: cfg.color }}
                      >
                        {cfg.short}
                      </span>
                      <div className="truncate">
                        <span className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wide block">
                          {formatViewName(dmg.view_type)}
                        </span>
                        <span className="text-slate-600 block truncate">{dmg.notes || cfg.label}</span>
                      </div>
                    </div>
                    {!readOnly && onRemoveDamage && (
                      <button
                        type="button"
                        onClick={() => onRemoveDamage(index)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                        title="Remover avaria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Adicionar Detalhe da Avaria */}
      {modalOpen && pendingCoord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs"
                  style={{ backgroundColor: getDamageConfig(selectedDamageType).color }}
                >
                  {getDamageConfig(selectedDamageType).short}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {getDamageConfig(selectedDamageType).label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 mb-4 space-y-1">
              <p>📍 Vista: <strong className="text-slate-800 uppercase">{formatViewName(pendingCoord.view)}</strong></p>
              <p>📏 Coordenadas: <span className="text-slate-500 font-mono">X: {pendingCoord.x}%, Y: {pendingCoord.y}%</span></p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Descrição / Detalhes da avaria (opcional):
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Risco de 4cm perto da maçaneta"
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmDamage()}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDamage}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/10"
              >
                Confirmar Ponto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
