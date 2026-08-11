'use client';

import React from 'react';
import VehicleBlueprint from '@/components/blueprint/VehicleBlueprint';
import FuelGauge from '@/components/inspection/FuelGauge';
import { Printer, ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface OfficialDocumentProps {
  inspection: any;
}

export default function OfficialChecklistDocument({ inspection }: OfficialDocumentProps) {
  const handlePrint = () => {
    window.print();
  };

  const belongingsList = inspection.belongings
    ? typeof inspection.belongings === 'string'
      ? JSON.parse(inspection.belongings)
      : inspection.belongings
    : [];

  const getAnswersByCategory = (cat: string) => {
    return (inspection.answers || []).filter((a: any) => a.category === cat);
  };

  const formatCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'INTERNO':
        return 'INTERNO';
      case 'FRENTE_LATERAIS':
        return 'FRENTE / LATERAIS';
      case 'TRASEIRA':
        return 'TRASEIRA';
      case 'TAMPAS_FLUIDOS_OUTROS':
        return 'TAMPAS FLUIDOS - OUTROS';
      case 'ESTATICO':
        return 'INSPEÇÃO ESTÁTICA';
      case 'RODAGEM':
        return 'TESTE DE RODAGEM';
      default:
        return cat.replace(/_/g, ' ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'S':
        return <span className="text-emerald-700 font-extrabold">S (OK)</span>;
      case 'N':
        return <span className="text-slate-500 font-bold">N (Não tem)</span>;
      case 'A':
        return <span className="text-amber-600 font-extrabold">A (Avariado)</span>;
      case 'I':
        return <span className="text-purple-600 font-extrabold">I (Incompleto)</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const photos = inspection.photos || [];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Botões de Ação Topo (Não aparecem na impressão) */}
      <div className="no-print mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Link
          href={`/inspecoes/${inspection.id}`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Detalhes
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-500/20 transition"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL A4 / PRINT PAGE */}
      <div className="print-page bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-md text-slate-900 text-[11px] leading-snug">
        {/* Título Principal */}
        <div className="border-b-4 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase text-slate-950">
              CHECKLIST DE INSPEÇÃO DO VEÍCULO
            </h1>
            <p className="text-[10px] text-slate-600 font-medium">
              Documento Oficial de Entrada e Vistoria Prévia FixCar
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-extrabold px-3 py-1 rounded text-xs">
              Nº O.S.: {inspection.os_number}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Data: {inspection.entry_date || new Date(inspection.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* CABEÇALHO / DADOS GERAIS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-300 p-3 rounded-lg bg-slate-50 mb-4 text-[11px]">
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Cliente:</span>
            <span className="font-semibold">{inspection.client?.name}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Telefone:</span>
            <span className="font-semibold">{inspection.client?.phone}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Veículo:</span>
            <span className="font-semibold">{inspection.vehicle?.model}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Cor:</span>
            <span className="font-semibold">{inspection.vehicle?.color}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Ano / Modelo:</span>
            <span className="font-semibold">{inspection.vehicle?.year_model}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Placa:</span>
            <span className="font-bold text-sky-900">{inspection.vehicle?.plate}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">KM Atual:</span>
            <span className="font-semibold">{inspection.vehicle?.km?.toLocaleString()} km</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Consultor / Inspetor:</span>
            <span className="font-semibold">{inspection.consultant_name || inspection.inspector?.name}</span>
          </div>
          <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200 flex items-center justify-between text-[10px]">
            <span>
              Condutor é a mesma pessoa que fez o agendamento?{' '}
              <strong>{inspection.is_driver_the_scheduler ? 'SIM' : 'NÃO'}</strong>
            </span>
            <span className="font-bold uppercase">
              Status da Vistoria: <span className="text-sky-700">{inspection.status}</span>
            </span>
          </div>
        </div>

        {/* SEÇÃO 1: CARROCERIA & BLUEPRINT */}
        <div className="mb-4">
          <div className="bg-red-600 text-white font-bold px-3 py-1 rounded-t flex items-center justify-between text-xs uppercase">
            <span>1. CARROCERIA & AVARIAS</span>
            <span className="text-[10px]">
              LEGENDA: (A) AMASSADO | (R) RISCADO | (X) QUEBRADO | (F) FALTANTE
            </span>
          </div>
          <div className="border border-t-0 border-slate-300 p-3 rounded-b">
            <VehicleBlueprint damages={inspection.damage_markings || []} readOnly={true} />

            {/* Observação da Carroceria */}
            {inspection.bodywork_notes && (
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
                <strong className="text-slate-700">Observações de Carroceria: </strong>
                {inspection.bodywork_notes}
              </div>
            )}

            {/* Pertences e Combustível */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
              <div className="border border-slate-200 p-2.5 rounded bg-slate-50 max-w-md">
                <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px]">
                  Pertences Deixados no Veículo:
                </span>
                {belongingsList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {belongingsList.map((item: string, i: number) => (
                      <span key={i} className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[10px]">Nenhum pertence pessoal informado.</span>
                )}
              </div>

              <div className="border border-slate-200 p-2.5 rounded bg-slate-50">
                <FuelGauge
                  value={inspection.fuel_level ?? 0.5}
                  batteryPercent={inspection.battery_lev_percent}
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: CHECKLIST DE ITENS */}
        <div className="mb-4">
          <div className="bg-red-600 text-white font-bold px-3 py-1 rounded-t flex items-center justify-between text-xs uppercase">
            <span>2. CHECAGEM DE ITENS E EQUIPAMENTOS</span>
            <span className="text-[10px]">S = SIM | N = NÃO TEM | A = AVARIADO | I = INCOMPLETO</span>
          </div>

          <div className="border border-t-0 border-slate-300 p-3 rounded-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Interno */}
              <div>
                <h4 className="font-bold bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase text-slate-800 mb-1.5">
                  {formatCategoryTitle('INTERNO')}
                </h4>
                <div className="space-y-1">
                  {getAnswersByCategory('INTERNO').map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-700">{item.item_name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Frente e Laterais */}
              <div>
                <h4 className="font-bold bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase text-slate-800 mb-1.5">
                  {formatCategoryTitle('FRENTE_LATERAIS')}
                </h4>
                <div className="space-y-1">
                  {getAnswersByCategory('FRENTE_LATERAIS').map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-700">{item.item_name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Traseira & Tampas / Fluidos */}
              <div>
                <h4 className="font-bold bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase text-slate-800 mb-1.5">
                  {formatCategoryTitle('TAMPAS_FLUIDOS_OUTROS')}
                </h4>
                <div className="space-y-1">
                  {getAnswersByCategory('TRASEIRA').slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-700">{item.item_name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                  {getAnswersByCategory('TAMPAS_FLUIDOS_OUTROS').map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-700">{item.item_name}</span>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pneus e Rodas */}
            {inspection.tires_notes && (
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-[10px]">
                <strong>Condições de Pneus e Rodas: </strong> {inspection.tires_notes}
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO 3: FOTOS DA VISTORIA / EVIDÊNCIAS FOTOGRÁFICAS */}
        {photos.length > 0 && (
          <div className="mb-4">
            <div className="bg-red-600 text-white font-bold px-3 py-1 rounded-t flex items-center justify-between text-xs uppercase">
              <span className="flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                3. EVIDÊNCIAS FOTOGRÁFICAS DA VISTORIA ({photos.length})
              </span>
              <span className="text-[10px]">REGISTRO VISUAL DO VEÍCULO E AVARIAS</span>
            </div>
            <div className="border border-t-0 border-slate-300 p-3 rounded-b bg-slate-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((p: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs">
                    <div className="h-28 bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={p.file_url}
                        alt={p.description || `Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[10px] bg-white border-t border-slate-200">
                      <span className="block font-bold text-slate-800 truncate">
                        {p.description || `Foto #${idx + 1}`}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase">{p.category || 'Vistoria'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 4: TERMOS E ASSINATURAS */}
        <div className="border border-slate-300 p-3 rounded-lg bg-slate-50">
          <div className="mb-3 text-[9px] text-slate-600 border-b border-slate-200 pb-2">
            <strong className="block text-slate-800 uppercase mb-0.5">Termos e Condições:</strong>
            1) Declaro(amos) estar(mos) de acordo com as observações contidas neste documento; <br />
            2) Conjuntamente a esta autorização, é facultativo à Concessionária operar o veículo especificado em ruas e estradas para fins de testes, quando eles se fizerem necessários.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Entrada */}
            <div className="border border-slate-300 p-3 rounded bg-white text-center">
              <span className="font-bold text-[10px] text-slate-800 block mb-2 uppercase">
                Declaro ter DEIXADO o veículo nas condições acima
              </span>
              {inspection.entry_signature ? (
                <img
                  src={inspection.entry_signature}
                  alt="Assinatura de Entrada"
                  className="h-16 mx-auto object-contain border-b border-slate-400 mb-1"
                />
              ) : (
                <div className="h-16 border-b border-slate-400 mb-1 flex items-end justify-center text-[10px] text-slate-400">
                  Assinatura do Cliente
                </div>
              )}
              <div className="text-[10px] text-slate-600 flex justify-between mt-1">
                <span>Data: {inspection.entry_date || '___/___/______'}</span>
                <span>Hora: {inspection.entry_time || '___:___'}</span>
              </div>
            </div>

            {/* Saída */}
            <div className="border border-slate-300 p-3 rounded bg-white text-center">
              <span className="font-bold text-[10px] text-slate-800 block mb-2 uppercase">
                Declaro ter RETIRADO o veículo nas condições acima
              </span>
              {inspection.exit_signature ? (
                <img
                  src={inspection.exit_signature}
                  alt="Assinatura de Saída"
                  className="h-16 mx-auto object-contain border-b border-slate-400 mb-1"
                />
              ) : (
                <div className="h-16 border-b border-slate-400 mb-1 flex items-end justify-center text-[10px] text-slate-400">
                  Assinatura do Cliente na Retirada
                </div>
              )}
              <div className="text-[10px] text-slate-600 flex justify-between mt-1">
                <span>Data: {inspection.exit_date || '___/___/______'}</span>
                <span>Hora: {inspection.exit_time || '___:___'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
