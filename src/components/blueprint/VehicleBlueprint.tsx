'use client';

import React, { useState } from 'react';
import { DamageMarkingData, DamageType, VehicleView } from '@/lib/types';
import { Trash2, X } from 'lucide-react';

interface VehicleBlueprintProps {
  damages: DamageMarkingData[];
  onAddDamage?: (damage: DamageMarkingData) => void;
  onRemoveDamage?: (index: number) => void;
  readOnly?: boolean;
}

const DAMAGE_TYPES: { type: DamageType; label: string; short: string; color: string; bg: string; border: string }[] = [
  { type: 'A', label: 'Amassado (A)', short: 'A', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  { type: 'R', label: 'Riscado (R)', short: 'R', color: '#ea580c', bg: '#ffedd5', border: '#fdba74' },
  { type: 'X', label: 'Quebrado (X)', short: 'X', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
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

  // Manipulador de clique na imagem unificada do blueprint
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    // Determina a vista baseada na proporção de Y
    let view: VehicleView = 'SUPERIOR_TETO';
    let localY = y;

    if (y < 34.0) {
      view = 'LATERAL_ESQUERDA';
      // Ajusta Y para a escala local de 0% a 100% dentro do primeiro terço
      localY = (y / 34.0) * 100;
    } else if (y > 66.0) {
      view = 'LATERAL_DIREITA';
      // Ajusta Y para a escala local dentro do último terço
      localY = ((y - 66.0) / 34.0) * 100;
    } else {
      view = 'SUPERIOR_TETO';
      // Ajusta Y para a escala local dentro do terço central
      localY = ((y - 34.0) / 32.0) * 100;
    }

    setPendingCoord({
      x: Number(x.toFixed(1)),
      y: Number(localY.toFixed(1)),
      view,
    });
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

  // Converte a coordenada local de volta para a posição percentual absoluta da imagem
  const getAbsoluteTopPercent = (view: string, localY: number) => {
    if (view === 'LATERAL_ESQUERDA') {
      return (localY / 100) * 34.0;
    } else if (view === 'LATERAL_DIREITA') {
      return 66.0 + (localY / 100) * 34.0;
    } else {
      return 34.0 + (localY / 100) * 32.0;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Seletor de Tipo de Avaria */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selecione a avaria e clique no veículo:
          </span>
          <div className="flex gap-2">
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all shadow-xs ${
                    isSelected ? 'ring-2 ring-offset-1 scale-105' : 'hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold"
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

      {/* Blueprint por imagem (CÓPIA EXATA DO PDF DE VISTORIA) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex justify-center w-full">
        <div
          onClick={handleImageClick}
          className={`relative w-full max-w-[290px] aspect-[3/4] overflow-hidden select-none border border-slate-250 bg-white ${
            !readOnly ? 'cursor-crosshair hover:brightness-[0.98]' : ''
          }`}
        >
          {/* Imagem do carro carregada do PDF */}
          <img
            src="/images/car_blueprint.jpg"
            alt="Desenho do Veículo"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Plotagem dinâmica dos Pins sobre a imagem carregada */}
          {damages.map((dmg, idx) => {
            const cfg = getDamageConfig(dmg.damage_type as DamageType);
            const topPercent = getAbsoluteTopPercent(dmg.view_type, dmg.coord_y);
            return (
              <div
                key={idx}
                style={{
                  left: `${dmg.coord_x}%`,
                  top: `${topPercent}%`,
                  backgroundColor: cfg.color,
                }}
                title={dmg.notes || cfg.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full text-white font-black text-[9px] flex items-center justify-center shadow-md border border-white hover:scale-125 transition-transform"
              >
                {cfg.short}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Avarias Registradas */}
      {damages.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-250 text-xs space-y-2">
          <h4 className="font-bold text-slate-700 uppercase tracking-wide">
            Avarias Marcadas ({damages.length}):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {damages.map((dmg, index) => {
              const cfg = getDamageConfig(dmg.damage_type as DamageType);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {cfg.short}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {dmg.view_type === 'LATERAL_ESQUERDA'
                        ? 'Lat. Esquerda'
                        : dmg.view_type === 'LATERAL_DIREITA'
                        ? 'Lat. Direita'
                        : 'Superior'}:
                    </span>
                    <span className="text-slate-600 truncate">{dmg.notes || cfg.label}</span>
                  </div>
                  {!readOnly && onRemoveDamage && (
                    <button
                      type="button"
                      onClick={() => onRemoveDamage(index)}
                      className="text-slate-400 hover:text-red-500 transition px-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para Adicionar Detalhe da Avaria */}
      {modalOpen && pendingCoord && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
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
              Vista:{' '}
              <strong className="text-slate-700">
                {pendingCoord.view === 'LATERAL_ESQUERDA'
                  ? 'Lateral Esquerda'
                  : pendingCoord.view === 'LATERAL_DIREITA'
                  ? 'Lateral Direita'
                  : 'Vista Superior'}
              </strong>
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
