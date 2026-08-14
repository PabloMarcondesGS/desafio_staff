'use client';

import React from 'react';
import VehicleBlueprint from '@/components/blueprint/VehicleBlueprint';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OfficialDocumentProps {
  inspection: any;
}

export default function OfficialChecklistDocument({ inspection }: OfficialDocumentProps) {
  const handlePrint = () => {
    window.print();
  };

  // Parsing de pertences
  const belongingsList = inspection.belongings
    ? typeof inspection.belongings === 'string'
      ? JSON.parse(inspection.belongings)
      : inspection.belongings
    : [];

  const hasPertence = (name: string) => {
    return belongingsList.some((item: string) => {
      const clean = item.toLowerCase().trim();
      if (clean === name.toLowerCase().trim()) return true;
      if (name.toLowerCase() === 'outros' && clean.startsWith('outros:')) return true;
      return false;
    });
  };

  const getOtherPertenceText = () => {
    const found = belongingsList.find((item: string) => item.toLowerCase().trim().startsWith('outros:'));
    return found ? found.substring(7).trim() : '';
  };

  // Funções de verificação de status para os itens de checagem
  const getItemStatus = (itemName: string) => {
    const ans = (inspection.answers || []).find(
      (a: any) => a.item_name.toLowerCase().trim() === itemName.toLowerCase().trim()
    );
    return ans ? ans.status : null; // Retorna S, N, A ou I
  };

  // Lógica de verificação para Pneus/Rodas/Calotas
  const isTireWheelStatusChecked = (position: string, type: string) => {
    const found = (inspection.tire_wheel_statuses || []).find(
      (t: any) => t.position === position && t.type === type
    );
    // Se o status for diferente de NAO_POSSUI (ou seja, se a pessoa possui e está checado)
    return found ? found.status !== 'NAO_POSSUI' : false;
  };

  // Lógica de combustível
  const fuel = inspection.fuel_level ?? 0.5; // 0 a 1
  // Cálculo do ângulo do ponteiro de combustível (0 a 180 graus correspondente a 0 a 1)
  const fuelAngle = -90 + fuel * 180;

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

      {/* RENDERIZAÇÃO DA PÁGINA EXATA DO PDF */}
      <div className="print-page bg-white p-5 rounded-none border border-slate-400 shadow-lg text-black text-[10px] leading-tight select-none">
        
        {/* BARRA SUPERIOR AZUL */}
        <div className="bg-[#1e3a8a] text-white text-center py-2.5 mb-3 font-extrabold text-sm tracking-wider uppercase">
          Checklist de Inspeção do Veículo
        </div>

        {/* TABELA DE CABEÇALHO (Dados Gerais) */}
        <table className="w-full border-collapse border border-black mb-3">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-2/3 border-r border-black p-1">
                <span className="font-bold uppercase text-[8px] text-slate-600 block">Cliente:</span>
                <span className="font-bold text-[10px]">{inspection.client?.name}</span>
              </td>
              <td className="w-1/3 p-1">
                <span className="font-bold uppercase text-[8px] text-slate-600 block">Telefone:</span>
                <span className="font-semibold text-[10px]">{inspection.client?.phone}</span>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-2/3 border-r border-black p-0">
                <table className="w-full border-none">
                  <tbody>
                    <tr>
                      <td className="w-1/2 border-r border-black p-1">
                        <span className="font-bold uppercase text-[8px] text-slate-600 block">Veículo:</span>
                        <span className="font-semibold text-[10px]">{inspection.vehicle?.model}</span>
                      </td>
                      <td className="w-1/2 p-1">
                        <span className="font-bold uppercase text-[8px] text-slate-600 block">Cor:</span>
                        <span className="font-semibold text-[10px]">{inspection.vehicle?.color}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className="w-1/3 p-1">
                <span className="font-bold uppercase text-[8px] text-slate-600 block">KM:</span>
                <span className="font-semibold text-[10px]">{inspection.vehicle?.km?.toLocaleString()}</span>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-2/3 border-r border-black p-0">
                <table className="w-full border-none">
                  <tbody>
                    <tr>
                      <td className="w-1/2 border-r border-black p-1">
                        <span className="font-bold uppercase text-[8px] text-slate-600 block">Ano/Modelo:</span>
                        <span className="font-semibold text-[10px]">{inspection.vehicle?.year_model}</span>
                      </td>
                      <td className="w-1/2 p-1">
                        <span className="font-bold uppercase text-[8px] text-slate-600 block">Placa:</span>
                        <span className="font-bold text-[10px] text-sky-800">{inspection.vehicle?.plate}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className="w-1/3 p-1">
                <span className="font-bold uppercase text-[8px] text-slate-600 block">Nº O.S.:</span>
                <span className="font-bold text-[10px] text-red-600">{inspection.os_number}</span>
              </td>
            </tr>
            <tr>
              <td className="w-2/3 border-r border-black p-1">
                <span className="font-bold uppercase text-[8px] text-slate-600 block">Consultor:</span>
                <span className="font-semibold text-[10px]">{inspection.consultant_name || inspection.inspector?.name}</span>
              </td>
              <td className="w-1/3 p-1 flex items-center gap-1.5 h-full pt-2">
                <span className="font-bold text-[8px] text-slate-700">O condutor é a mesma pessoa que fez o agendamento?</span>
                <span className="flex items-center gap-0.5">
                  <span className="border border-black px-1 py-0.2 font-bold bg-slate-50">{inspection.is_driver_the_scheduler ? 'X' : ' '}</span>
                  <span className="text-[8px] font-bold">SIM</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="border border-black px-1 py-0.2 font-bold bg-slate-50">{!inspection.is_driver_the_scheduler ? 'X' : ' '}</span>
                  <span className="text-[8px] font-bold">NÃO</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* SEÇÃO 1: CARROCERIA */}
        <div className="border border-black mb-3">
          <div className="bg-red-600 text-white font-bold text-center py-1 text-xs tracking-wider uppercase border-b border-black">
            1. CARROCERIA
          </div>
          
          <table className="w-full border-collapse">
            <tbody>
              <tr className="bg-red-600 text-white font-bold text-center border-b border-black text-[9px]">
                <td className="w-1/2 border-r border-black py-0.5">AMASSADO (A) | RISCADO (R) | QUEBRADO (X) | FALTANTE (F)</td>
                <td className="w-1/2 py-0.5">OBSERVAÇÃO / DETALHES</td>
              </tr>
              <tr>
                {/* Lado Esquerdo: Blueprint (45% de largura para dar mais espaço à direita) */}
                <td className="w-[45%] border-r border-black p-2.5 vertical-align-top bg-white">
                  <VehicleBlueprint damages={inspection.damage_markings || []} readOnly={true} />
                  
                  {/* Teste de Rodagem Perguntas */}
                  <div className="mt-3.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px]">
                    <span className="font-bold">Houve necessidade de realizar o teste de Rodagem/Diagnóstico com o cliente?</span>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1">
                        <span className="border border-black px-1.2 font-bold bg-slate-50">{inspection.test_drive_needed ? 'X' : ' '}</span>
                        <span>SIM</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="border border-black px-1.2 font-bold bg-slate-50">{!inspection.test_drive_needed ? 'X' : ' '}</span>
                        <span>NÃO</span>
                      </span>
                    </div>
                  </div>

                  {/* Capas de Proteção e Garantia Checkboxes */}
                  <div className="mt-2.5 flex justify-between text-[9px] font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="border border-black px-1.2 bg-slate-50">{inspection.protective_covers_placed ? 'X' : ' '}</span>
                      <span>Colocar as capas de proteção</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="border border-black px-1.2 bg-slate-50">{inspection.warranty_manual_requested ? 'X' : ' '}</span>
                      <span>Solicitar Manual de Garantia</span>
                    </span>
                  </div>
                </td>

                {/* Lado Direito: Observações, Pertences, Combustível (55% de largura para melhor leitura) */}
                <td className="w-[55%] p-3 vertical-align-top">
                  <div className="flex flex-col justify-between h-full gap-5">
                    
                    {/* Linhas de Observação com maior altura mínima */}
                    <div className="border-b border-black pb-2 min-h-[70px] text-[11px] leading-relaxed">
                      <span className="font-bold text-slate-800 block text-[9px] uppercase tracking-wider mb-0.5">Observações Gerais / Detalhes:</span>
                      {inspection.bodywork_notes || <span className="text-slate-400 italic">Nenhuma avaria anotada manualmente nas observações.</span>}
                    </div>

                    {/* Quadro de Pertences com maior espaçamento vertical */}
                    <div className="border border-black p-2.5 bg-white">
                      <div className="text-center font-extrabold text-[9.5px] uppercase border-b border-black pb-1 mb-2 tracking-wide">
                        Pertences pessoais deixados no veículo
                      </div>
                      <div className="grid grid-cols-3 gap-y-2 gap-x-2.5 text-[9.5px] font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Óculos') ? 'X' : ' '}</span>
                          <span>Óculos</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Notebook') ? 'X' : ' '}</span>
                          <span>Notebook</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Cadeira de Criança') ? 'X' : ' '}</span>
                          <span>Cadeira</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Relógio') ? 'X' : ' '}</span>
                          <span>Relógio</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Mochila') ? 'X' : ' '}</span>
                          <span>Mochila</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Outros') ? 'X' : ' '}</span>
                          <span className="truncate" title={getOtherPertenceText()}>Outros</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Tablet') ? 'X' : ' '}</span>
                          <span>Tablet</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Compras') ? 'X' : ' '}</span>
                          <span>Compras</span>
                        </span>
                        <span className="col-span-1 text-[8.5px] text-slate-500 truncate italic pl-1 leading-none">
                          {getOtherPertenceText() ? `(${getOtherPertenceText()})` : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Celular') ? 'X' : ' '}</span>
                          <span>Celular</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="border border-black px-1.5 font-bold bg-slate-50">{hasPertence('Livros') ? 'X' : ' '}</span>
                          <span>Livros</span>
                        </span>
                      </div>
                    </div>

                    {/* Quadro Combustível & Bateria com maior padding */}
                    <div className="border border-black p-2.5 bg-white">
                      <div className="text-center font-extrabold text-[9.5px] uppercase border-b border-black pb-1 mb-2 tracking-wide">
                        Nível de Combustível / Bateria LEV
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        {/* Checkboxes Caçamba/Capota */}
                        <div className="col-span-1 flex flex-col gap-1.5 text-[9px] font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="border border-black px-1 bg-slate-50">{inspection.has_bed ? 'X' : ' '}</span>
                            <span>Caçamba</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="border border-black px-1 bg-slate-50">{inspection.has_marine_cover ? 'X' : ' '}</span>
                            <span>Capota M.</span>
                          </span>
                        </div>
                        
                        {/* Ponteiro Analógico */}
                        <div className="col-span-2 flex flex-col items-center relative h-14 justify-end pb-1 border-r border-slate-200">
                          <div className="w-20 h-10 border-t-4 border-l-4 border-r-4 border-slate-800 rounded-t-full relative overflow-hidden bg-slate-50">
                            {/* Marcações */}
                            <span className="absolute left-1.5 bottom-0.5 text-[8px] font-black text-slate-600">0</span>
                            <span className="absolute left-3 top-1 text-[8px] font-black text-slate-600">1/4</span>
                            <span className="absolute left-1/2 -translate-x-1/2 top-0.5 text-[8px] font-black text-slate-600">1/2</span>
                            <span className="absolute right-3 top-1 text-[8px] font-black text-slate-600">3/4</span>
                            <span className="absolute right-1.5 bottom-0.5 text-[8px] font-black text-slate-600">1</span>
                            
                            {/* Ponteiro Físico */}
                            <div 
                              style={{ transform: `rotate(${fuelAngle}deg)` }}
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-9 bg-red-600 origin-bottom transition-transform duration-500 shadow-sm"
                            />
                          </div>
                          <span className="text-[8.5px] font-black text-slate-700 mt-1 uppercase">Combustível</span>
                        </div>

                        {/* Bateria LEV */}
                        <div className="col-span-1 text-center">
                          <span className="text-[8px] font-black text-red-600 block uppercase leading-none mb-1.5">% BATERIA LEV</span>
                          <span className="border-b-2 border-black font-black text-base px-2 pb-0.5 text-slate-900 bg-slate-50 rounded-sm">
                            {inspection.battery_lev_percent !== null ? `${inspection.battery_lev_percent}%` : '--'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SEÇÃO 2: CHECAR OS ITENS ABAIXO */}
        <div className="border border-black mb-3">
          <div className="bg-red-600 text-white font-bold text-center py-1 text-xs tracking-wider uppercase border-b border-black">
            2. CHECAR OS ITENS ABAIXO
          </div>
          <div className="bg-slate-900 text-white text-center py-0.5 text-[8.5px] font-bold border-b border-black">
            LEGENDA: SIM (S) | NÃO TEM (N) | AVARIADO (A) | INCOMPLETO (I)
          </div>

          <div className="grid grid-cols-4 text-[8px] border-b border-black bg-slate-50 font-extrabold text-center uppercase py-0.5 text-red-650">
            <div className="border-r border-black">Interno</div>
            <div className="border-r border-black">Frente e Laterais</div>
            <div className="border-r border-black">Traseira</div>
            <div>Tampas Internas, Óleos, Filtros e Outros</div>
          </div>

          {/* Grid de Itens em 4 Colunas com quadradinhos antes do nome do item */}
          <div className="grid grid-cols-4 text-[8.5px]">
            {/* Coluna 1: Interno */}
            <div className="border-r border-black p-1.5 space-y-1">
              {[
                'Rádio /CD /DVD',
                'Extintor',
                'Tapetes',
                'Bancos',
                'Painel Interno',
                'Ar-condicionado',
                'Retrovisor Interno',
                'Para-sol'
              ].map((item, idx) => {
                const st = getItemStatus(item);
                const isChecked = st === 'S' || st === 'OK' || !st;
                return (
                  <div key={idx} className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                    <span className="border border-black px-1 font-bold text-[8.5px] bg-slate-50 shrink-0 select-none">
                      {isChecked ? 'X' : ' '}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{item}</span>
                  </div>
                );
              })}
            </div>

            {/* Coluna 2: Frente e Laterais */}
            <div className="border-r border-black p-1.5 space-y-1">
              {[
                'Capô',
                'Protetor de Cárter',
                'Para-brisa',
                'Palhetas Dianteiras',
                'Antena',
                'Faróis Dianteiros',
                'Faróis de Neblina',
                'Pisca-alertas',
                'Tampa de Combustível'
              ].map((item, idx) => {
                const st = getItemStatus(item);
                const isChecked = st === 'S' || st === 'OK' || !st;
                return (
                  <div key={idx} className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                    <span className="border border-black px-1 font-bold text-[8.5px] bg-slate-50 shrink-0 select-none">
                      {isChecked ? 'X' : ' '}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{item}</span>
                  </div>
                );
              })}
            </div>

            {/* Coluna 3: Traseira */}
            <div className="border-r border-black p-1.5 space-y-1">
              {[
                'Estepe',
                'Macaco',
                'Triângulo',
                'Chave de Roda',
                'Para-brisa',
                'Palheta Traseira',
                'Faróis Internos',
                'Pisca-alertas',
                'Sensor Estacionamento',
                'Ponteira Escapamento'
              ].map((item, idx) => {
                const st = getItemStatus(item);
                const isChecked = st === 'S' || st === 'OK' || !st;
                return (
                  <div key={idx} className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                    <span className="border border-black px-1 font-bold text-[8.5px] bg-slate-50 shrink-0 select-none">
                      {isChecked ? 'X' : ' '}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{item}</span>
                  </div>
                );
              })}
            </div>

            {/* Coluna 4: Tampas Internas, Óleos, Filtros */}
            <div className="p-1.5 space-y-1">
              {[
                'Partida a Frio',
                'Limpador de Para-brisa',
                'Óleo',
                'Radiador',
                'Fluido de Freios',
                'Filtro de Ar-condicionado',
                'Bateria'
              ].map((item, idx) => {
                const st = getItemStatus(item);
                const isChecked = st === 'S' || st === 'OK' || !st;
                return (
                  <div key={idx} className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                    <span className="border border-black px-1 font-bold text-[8.5px] bg-slate-50 shrink-0 select-none">
                      {isChecked ? 'X' : ' '}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabela de Rodas, Pneus e Calotas do Rodapé da Seção 2 */}
          <table className="w-full border-t border-black border-collapse text-[8px]">
            <tbody>
              <tr className="bg-slate-100 text-center font-bold text-[8px] uppercase border-b border-black">
                <td className="border-r border-black py-0.5 w-1/4">Pneus (OK)</td>
                <td className="border-r border-black py-0.5 w-1/4">Calotas (OK)</td>
                <td className="border-r border-black py-0.5 w-1/4">Rodas de Liga Leve (OK)</td>
                <td className="py-0.5 w-1/4">Observações Pneus/Rodas</td>
              </tr>
              <tr>
                {/* Checkboxes PNEUS */}
                <td className="border-r border-black p-1 text-[7.5px] font-bold">
                  <div className="grid grid-cols-2 gap-y-0.5">
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('DIANTEIRO_D', 'PNEU') ? 'X' : ' '}</span>
                      <span>Dianteiro D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('DIANTEIRO_E', 'PNEU') ? 'X' : ' '}</span>
                      <span>Dianteiro E</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('TRASEIRO_D', 'PNEU') ? 'X' : ' '}</span>
                      <span>Traseiro D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('TRASEIRO_E', 'PNEU') ? 'X' : ' '}</span>
                      <span>Traseiro E</span>
                    </span>
                  </div>
                </td>

                {/* Checkboxes CALOTAS */}
                <td className="border-r border-black p-1 text-[7.5px] font-bold">
                  <div className="grid grid-cols-2 gap-y-0.5">
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('DIANTEIRO_D', 'CALOTA') ? 'X' : ' '}</span>
                      <span>Dianteira D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('DIANTEIRO_E', 'CALOTA') ? 'X' : ' '}</span>
                      <span>Dianteira E</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('TRASEIRO_D', 'CALOTA') ? 'X' : ' '}</span>
                      <span>Traseira D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('TRASEIRO_E', 'CALOTA') ? 'X' : ' '}</span>
                      <span>Traseira E</span>
                    </span>
                  </div>
                </td>

                {/* Checkboxes RODAS */}
                <td className="border-r border-black p-1 text-[7.5px] font-bold">
                  <div className="grid grid-cols-2 gap-y-0.5">
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('DIANTEIRO_D', 'RODA_LIGA_LEVE') ? 'X' : ' '}</span>
                      <span>Dianteira D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('DIANTEIRO_E', 'RODA_LIGA_LEVE') ? 'X' : ' '}</span>
                      <span>Dianteira E</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('TRASEIRO_D', 'RODA_LIGA_LEVE') ? 'X' : ' '}</span>
                      <span>Traseira D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-black px-1 font-bold bg-white">{isTireWheelStatusChecked('TRASEIRO_E', 'RODA_LIGA_LEVE') ? 'X' : ' '}</span>
                      <span>Traseira E</span>
                    </span>
                  </div>
                </td>

                {/* Observações de Pneus */}
                <td className="p-1 align-top italic text-[7.5px] text-slate-700">
                  {inspection.tires_notes || 'Sem avarias ou desgastes detectados nos pneus.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SEÇÃO 3: INSPEÇÃO FINAL */}
        <div className="border border-black mb-3">
          <div className="bg-red-600 text-white font-bold text-center py-1 text-xs tracking-wider uppercase border-b border-black">
            3. INSPEÇÃO FINAL
          </div>

          <div className="grid grid-cols-2 text-[8px] border-b border-black bg-slate-50 font-extrabold text-center uppercase py-0.5 text-red-650">
            <div className="border-r border-black">Estático</div>
            <div>Rodagem</div>
          </div>

          <div className="grid grid-cols-2 text-[8.5px]">
            {/* ESTÁTICO */}
            <td className="border-r border-black p-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
              {[
                'Pressão de Pneus/Estepes',
                'Nível dos Fluidos',
                'Lavadores Para-brisa',
                'Faróis alto/baixo',
                'Faróis de Neblina',
                'Vidros/Espelhos',
                'Alarme',
                'Buzina',
                'Sistema de Áudio/Relógio',
                'Freio de Estacionamento'
              ].map((item, idx) => {
                const st = getItemStatus(item);
                const isChecked = st === 'S' || st === 'OK' || !st;
                return (
                  <div key={idx} className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                    <span className="border border-black px-1 font-bold text-[8.5px] bg-slate-50 shrink-0 select-none">
                      {isChecked ? 'X' : ' '}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{item}</span>
                  </div>
                );
              })}
            </td>

            {/* RODAGEM */}
            <td className="p-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
              {[
                'Temperatura do Motor',
                'Quadros de Instrumento',
                'Marcha Lenta',
                'Ar-condicionado',
                'Motor',
                'Transmissão',
                'Alinhamento da Direção',
                'Suspensão',
                'Frenagem'
              ].map((item, idx) => {
                const st = getItemStatus(item);
                const isChecked = st === 'S' || st === 'OK' || !st;
                return (
                  <div key={idx} className="flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                    <span className="border border-black px-1 font-bold text-[8.5px] bg-slate-50 shrink-0 select-none">
                      {isChecked ? 'X' : ' '}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{item}</span>
                  </div>
                );
              })}
            </td>
          </div>
        </div>

        {/* EVIDÊNCIAS FOTOGRÁFICAS (Adicionado abaixo do papel apenas na tela/impressão) */}
        {inspection.photos && inspection.photos.length > 0 && (
          <div className="border border-black mb-3 no-print">
            <div className="bg-[#1e3a8a] text-white font-bold px-3 py-1 text-xs tracking-wider uppercase border-b border-black">
              Fotos Anexadas da Vistoria ({inspection.photos.length})
            </div>
            <div className="p-3 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {inspection.photos.map((p: any, idx: number) => (
                <div key={idx} className="bg-white rounded border border-slate-300 overflow-hidden shadow-xs">
                  <div className="h-24 bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={p.file_url} alt="Evidência" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-1 text-[8.5px] font-semibold text-slate-800 truncate">
                    {p.description || `Foto #${idx + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TERMOS E CONDIÇÕES & QUADROS DE ASSINATURA */}
        <div className="border border-black p-2 bg-[#fdfbf7] text-[8px] leading-tight mb-3">
          <strong className="block text-black uppercase mb-0.5">TERMOS E CONDIÇÕES:</strong>
          1) Declaro(amos) estar(mos) de acordo com as observações contidas neste documento; <br />
          2) Conjuntamente a esta autorização, é facultativo à Concessionária operar o veículo especificado em ruas e estradas para fins de testes, quando eles se fizerem necessários.
        </div>

        {/* ASSINATURAS LADO A LADO */}
        <div className="grid grid-cols-2 gap-3">
          {/* Deixado */}
          <div className="border border-black p-2 bg-white text-center">
            <span className="font-extrabold text-[8.5px] text-slate-800 block mb-2 uppercase">
              Declaro ter DEIXADO o veículo acima nas condições informadas
            </span>
            <div className="h-12 border-b border-black mb-1 flex items-center justify-center overflow-hidden">
              {inspection.entry_signature ? (
                <img src={inspection.entry_signature} alt="Assinatura Entrada" className="h-full object-contain" />
              ) : (
                <span className="text-slate-400 text-[8px] italic">Sem Assinatura Coletada</span>
              )}
            </div>
            <span className="text-[7.5px] text-slate-500 block uppercase mb-1">Assinatura do cliente ou representante autorizado</span>
            <div className="text-[8.5px] text-slate-700 flex justify-between font-semibold px-2">
              <span>Data: {inspection.entry_date || '___/___/______'}</span>
              <span>Hora: {inspection.entry_time || '___:___'}</span>
            </div>
          </div>

          {/* Retirado */}
          <div className="border border-black p-2 bg-white text-center">
            <span className="font-extrabold text-[8.5px] text-slate-800 block mb-2 uppercase">
              Declaro ter RETIRADO o veículo acima nas condições informadas
            </span>
            <div className="h-12 border-b border-black mb-1 flex items-center justify-center overflow-hidden">
              {inspection.exit_signature ? (
                <img src={inspection.exit_signature} alt="Assinatura Saída" className="h-full object-contain" />
              ) : (
                <span className="text-slate-400 text-[8px] italic">Sem Assinatura Coletada</span>
              )}
            </div>
            <span className="text-[7.5px] text-slate-500 block uppercase mb-1">Assinatura do cliente ou representante autorizado</span>
            <div className="text-[8.5px] text-slate-700 flex justify-between font-semibold px-2">
              <span>Data: {inspection.exit_date || '___/___/______'}</span>
              <span>Hora: {inspection.exit_time || '___:___'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
