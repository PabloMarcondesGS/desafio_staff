'use client';

import React, { useState } from 'react';
import { DamageMarkingData, DamageType, VehicleView } from '@/lib/types';
import { Plus, Trash2, X, AlertCircle, Eye } from 'lucide-react';

interface VehicleBlueprintProps {
  damages: DamageMarkingData[];
  onAddDamage?: (damage: DamageMarkingData) => void;
  onRemoveDamage?: (index: number) => void;
  readOnly?: boolean;
}

const DAMAGE_TYPES: { type: DamageType; label: string; short: string; color: string; bg: string; border: string }[] = [
  { type: 'A', label: 'Amassado (A)', short: 'A', color: '#ea580c', bg: '#ffedd5', border: '#fdba74' },
  { type: 'R', label: 'Riscado (R)', short: 'R', color: '#ca8a04', bg: '#fef9c3', border: '#fde047' },
  { type: 'X', label: 'Quebrado (X)', short: 'X', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  { type: 'F', label: 'Faltante (F)', short: 'F', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
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

  return (
    <div className="flex flex-col gap-4">
      {/* Damage Type Selector */}
      {!readOnly && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selecione a avaria e clique no veículo:
          </span>
          <div className="flex flex-wrap gap-2">
            {DAMAGE_TYPES.map((item) => {
              const isSelected = selectedDamageType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedDamageType(item.type)}
                  style={{
                    backgroundColor: isSelected ? item.bg : 'white',
                    borderColor: isSelected ? item.color : '#e2e8f0',
                    color: isSelected ? item.color : '#475569',
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${
                    isSelected ? 'ring-2 ring-offset-1 scale-105' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.short}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Blueprint Graphical Views Box */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Vista Lateral Esquerda (Topo) */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lateral Esquerda</span>
            <div
              onClick={(e) => handleDiagramClick(e, 'LATERAL_ESQUERDA')}
              className="relative w-full max-w-md h-28 border border-slate-200 rounded-xl bg-slate-50/70 cursor-crosshair overflow-hidden flex items-center justify-center select-none"
            >
              {/* Car Side Left SVG Outline */}
              <svg viewBox="0 0 400 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none">
                <path d="M 40 85 C 40 85 45 70 80 65 C 110 65 140 35 220 35 C 290 35 320 60 360 65 C 375 70 375 85 365 85 L 340 85 C 335 70 305 70 300 85 L 140 85 C 135 70 105 70 100 85 Z" strokeWidth="2.5" fill="#f1f5f9"/>
                <circle cx="120" cy="85" r="16" strokeWidth="3" fill="#cbd5e1" />
                <circle cx="320" cy="85" r="16" strokeWidth="3" fill="#cbd5e1" />
                <path d="M 145 65 L 145 42 C 175 40 215 40 215 65 Z" strokeWidth="1.5" />
                <path d="M 225 65 L 225 40 C 265 40 285 55 305 65 Z" strokeWidth="1.5" />
                <rect x="210" y="68" width="12" height="4" rx="2" fill="#94a3b8" />
                <rect x="290" y="68" width="12" height="4" rx="2" fill="#94a3b8" />
              </svg>

              {/* Damaged Pins */}
              {damages
                .filter((d) => d.view_type === 'LATERAL_ESQUERDA')
                .map((dmg, idx) => {
                  const cfg = getDamageConfig(dmg.damage_type as DamageType);
                  return (
                    <div
                      key={idx}
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%`, backgroundColor: cfg.color }}
                      title={dmg.notes || cfg.label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-white font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                    >
                      {cfg.short}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Vista Superior / Planta / Teto */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vista Superior (Teto / Capô / Porta-Malas)</span>
            <div
              onClick={(e) => handleDiagramClick(e, 'SUPERIOR_TETO')}
              className="relative w-full max-w-md h-36 border border-slate-200 rounded-xl bg-slate-50/70 cursor-crosshair overflow-hidden flex items-center justify-center select-none"
            >
              {/* Car Top View SVG */}
              <svg viewBox="0 0 360 140" className="w-full h-full p-2 text-slate-600 stroke-current fill-none">
                <rect x="50" y="25" width="260" height="90" rx="40" strokeWidth="2.5" fill="#f1f5f9" />
                {/* Para-brisa dianteiro */}
                <path d="M 120 30 Q 140 70 120 110" strokeWidth="2" />
                {/* Teto */}
                <rect x="140" y="32" width="110" height="76" rx="10" strokeWidth="1.5" />
                {/* Vidro Traseiro */}
                <path d="M 265 32 Q 255 70 265 108" strokeWidth="2" />
                {/* Retrovisores */}
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
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%`, backgroundColor: cfg.color }}
                      title={dmg.notes || cfg.label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-white font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                    >
                      {cfg.short}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Vista Frontal */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frente</span>
            <div
              onClick={(e) => handleDiagramClick(e, 'FRONTAL')}
              className="relative w-full max-w-xs h-28 border border-slate-200 rounded-xl bg-slate-50/70 cursor-crosshair overflow-hidden flex items-center justify-center select-none"
            >
              <svg viewBox="0 0 200 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none">
                <path d="M 40 40 L 160 40 L 175 80 L 170 100 L 30 100 L 25 80 Z" strokeWidth="2.5" fill="#f1f5f9" />
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
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%`, backgroundColor: cfg.color }}
                      title={dmg.notes || cfg.label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-white font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                    >
                      {cfg.short}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Vista Traseira */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Traseira</span>
            <div
              onClick={(e) => handleDiagramClick(e, 'TRASEIRA')}
              className="relative w-full max-w-xs h-28 border border-slate-200 rounded-xl bg-slate-50/70 cursor-crosshair overflow-hidden flex items-center justify-center select-none"
            >
              <svg viewBox="0 0 200 120" className="w-full h-full p-2 text-slate-600 stroke-current fill-none">
                <path d="M 40 40 L 160 40 L 175 80 L 170 100 L 30 100 L 25 80 Z" strokeWidth="2.5" fill="#f1f5f9" />
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
                      style={{ left: `${dmg.coord_x}%`, top: `${dmg.coord_y}%`, backgroundColor: cfg.color }}
                      title={dmg.notes || cfg.label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-white font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                    >
                      {cfg.short}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Lista de Avarias Registradas */}
        {damages.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Avarias Registradas ({damages.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {damages.map((dmg, index) => {
                const cfg = getDamageConfig(dmg.damage_type as DamageType);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      >
                        {cfg.short}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">{dmg.view_type.replace('_', ' ')}: </span>
                        <span className="text-slate-600">{dmg.notes || cfg.label}</span>
                      </div>
                    </div>
                    {!readOnly && onRemoveDamage && (
                      <button
                        type="button"
                        onClick={() => onRemoveDamage(index)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: getDamageConfig(selectedDamageType).color }}
                >
                  {getDamageConfig(selectedDamageType).short}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {getDamageConfig(selectedDamageType).label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Vista: <strong className="text-slate-700">{pendingCoord.view.replace('_', ' ')}</strong> (X: {pendingCoord.x}%, Y: {pendingCoord.y}%)
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição / Detalhes da avaria (opcional):
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Risco de 4cm perto da maçaneta"
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmDamage()}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDamage}
                className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 shadow-sm"
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
