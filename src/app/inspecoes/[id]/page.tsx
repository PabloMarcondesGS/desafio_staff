'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VehicleBlueprint from '@/components/blueprint/VehicleBlueprint';
import FuelGauge from '@/components/inspection/FuelGauge';
import SignaturePad from '@/components/inspection/SignaturePad';
import { useFeedback } from '@/contexts/FeedbackContext';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  Car,
  User,
  ShieldCheck,
  Printer
} from 'lucide-react';

export default function InspectionDetailsPage() {
  const { token, user } = useAuth();
  const { showSuccess, showError, showAlert } = useFeedback();
  const params = useParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Retirada
  const [exitSignature, setExitSignature] = useState<string | null>(null);
  const [exitDate, setExitDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [exitTime, setExitTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [submittingExit, setSubmittingExit] = useState(false);

  const isValidDateBR = (str: string): boolean => {
    const match = str.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 2000 || year > 2100) return false;
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
  };

  const isValidTime = (str: string): boolean => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(str.trim());
  };

  const handleDateChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 8);
    if (clean.length > 4) {
      clean = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
    } else if (clean.length > 2) {
      clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setExitDate(clean);
  };

  const handleTimeChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      clean = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    setExitTime(clean);
  };

  const fetchInspection = () => {
    if (!token || !params.id) return;
    fetch(`/api/inspections/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInspection(data);
        if (data.exit_signature) setExitSignature(data.exit_signature);
        if (data.exit_date) setExitDate(data.exit_date);
        if (data.exit_time) setExitTime(data.exit_time);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar detalhes:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInspection();
  }, [token, params.id]);

  const handleRegisterExit = async () => {
    if (!token || !inspection) return;

    if (!isValidDateBR(exitDate)) {
      showError('Informe uma data de retirada válida no formato DD/MM/AAAA (ex: 11/08/2026).', 'Data Inválida');
      return;
    }

    if (!isValidTime(exitTime)) {
      showError('Informe um horário de retirada válido no formato HH:MM (ex: 14:30).', 'Horário Inválido');
      return;
    }

    setSubmittingExit(true);

    try {
      const res = await fetch(`/api/inspections/${inspection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: 'RETIRADO',
          exit_signature: exitSignature,
          exit_date: exitDate,
          exit_time: exitTime,
        }),
      });

      if (res.ok) {
        showSuccess('Saída/Retirada do veículo registrada com sucesso!', 'Retirada Concluída');
        fetchInspection();
      } else {
        showError('Erro ao registrar retirada do veículo.');
      }
    } catch (e) {
      showError('Erro de conexão ao salvar retirada.');
    } finally {
      setSubmittingExit(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!inspection) return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/inspecoes"
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900">{inspection.os_number}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    inspection.status === 'FINALIZADO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inspection.status === 'RETIRADO'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {inspection.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vistoria realizada em {new Date(inspection.created_at).toLocaleDateString('pt-BR')} por{' '}
                <strong>{inspection.consultant_name}</strong>
              </p>
            </div>
          </div>

          <Link
            href={`/inspecoes/${inspection.id}/laudo`}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-700 shadow-md shadow-sky-600/20"
          >
            <Printer className="h-4 w-4" />
            Ver Laudo Completo / Imprimir
          </Link>
        </div>

        {/* Resumo do Veículo & Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Car className="h-4 w-4 text-sky-600" />
              Dados do Veículo
            </h3>
            <div className="space-y-1.5 text-xs">
              <div><strong className="text-slate-600">Modelo:</strong> {inspection.vehicle?.model}</div>
              <div><strong className="text-slate-600">Placa:</strong> <span className="font-bold text-sky-800">{inspection.vehicle?.plate}</span></div>
              <div><strong className="text-slate-600">Cor:</strong> {inspection.vehicle?.color}</div>
              <div><strong className="text-slate-600">Ano/Modelo:</strong> {inspection.vehicle?.year_model}</div>
              <div><strong className="text-slate-600">KM:</strong> {inspection.vehicle?.km?.toLocaleString()} km</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-sky-600" />
              Dados do Cliente
            </h3>
            <div className="space-y-1.5 text-xs">
              <div><strong className="text-slate-600">Nome:</strong> {inspection.client?.name}</div>
              <div><strong className="text-slate-600">Telefone:</strong> {inspection.client?.phone}</div>
              <div><strong className="text-slate-600">Documento:</strong> {inspection.client?.document || 'Não informado'}</div>
            </div>
          </div>
        </div>

        {/* Blueprint & Avarias */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Mapa de Avarias no Blueprint da Carroceria
          </h3>
          <VehicleBlueprint damages={inspection.damage_markings || []} readOnly={true} />
        </div>

        {/* Fotos de Evidência da Vistoria */}
        {inspection.photos && inspection.photos.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Evidências Fotográficas da Vistoria ({inspection.photos.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inspection.photos.map((p: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden shadow-xs group">
                  <div className="h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={p.file_url}
                      alt={p.description || `Foto ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  </div>
                  <div className="p-2 text-xs bg-slate-50 border-t border-slate-200">
                    <p className="font-semibold text-slate-800 truncate">{p.description || `Foto #${idx + 1}`}</p>
                    <span className="text-[10px] text-slate-500 uppercase font-medium">{p.category || 'Vistoria'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Termo de Retirada do Veículo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Registro de Saída / Retirada do Veículo
          </h3>

          {inspection.status === 'RETIRADO' ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <p className="font-bold">✓ Veículo retirado pelo cliente em {inspection.exit_date} às {inspection.exit_time}</p>
              {inspection.exit_signature && (
                <img src={inspection.exit_signature} alt="Assinatura Saída" className="h-16 mt-2 object-contain bg-white p-2 rounded border" />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <SignaturePad
                value={exitSignature}
                onChange={setExitSignature}
                label="Declaro ter RETIRADO o veículo nas condições informadas no Checklist (Assinatura do Cliente):"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Data de Retirada (Hoje):</label>
                  <input
                    type="text"
                    readOnly
                    value={exitDate}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-600 px-3 py-1.5 font-bold cursor-not-allowed select-none"
                    title="Data preenchida automaticamente com a data de hoje"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Hora de Retirada (HH:MM) *:</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="HH:MM"
                    value={exitTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={submittingExit || !exitSignature}
                  onClick={handleRegisterExit}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                >
                  {submittingExit ? 'Salvando...' : 'Confirmar Retirada do Veículo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
