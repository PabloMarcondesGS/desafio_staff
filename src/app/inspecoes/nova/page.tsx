'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useRouter } from 'next/navigation';
import VehicleBlueprint from '@/components/blueprint/VehicleBlueprint';
import FuelGauge from '@/components/inspection/FuelGauge';
import SignaturePad from '@/components/inspection/SignaturePad';
import { DamageMarkingData, ItemCheckStatus } from '@/lib/types';
import {
  Car,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Upload,
  FileCheck,
  Check,
  XCircle
} from 'lucide-react';

const PERTENCES_OPTIONS = [
  'Óculos',
  'Notebook',
  'Cadeira de Criança',
  'Relógio',
  'Mochila',
  'Tablet',
  'Compras',
  'Celular',
  'Livros',
];

export default function NewInspectionWizardPage() {
  const { token, user } = useAuth();
  const { showSuccess, showError, showAlert } = useFeedback();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dados Cadastrais
  const [clients, setClients] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [templateItems, setTemplateItems] = useState<any[]>([]);

  // Formulário Principal
  const [osNumber, setOsNumber] = useState(`OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [consultantName, setConsultantName] = useState(user?.name || '');
  const [isDriverTheScheduler, setIsDriverTheScheduler] = useState(true);

  // Cadastro Rápido de Novo Veículo se necessário
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleKm, setVehicleKm] = useState(0);
  const [vehicleYearModel, setVehicleYearModel] = useState('2023/2024');

  // Carroceria & Blueprint
  const [damages, setDamages] = useState<DamageMarkingData[]>([]);
  const [bodyworkNotes, setBodyworkNotes] = useState('');
  const [selectedBelongings, setSelectedBelongings] = useState<string[]>([]);
  const [otherBelongings, setOtherBelongings] = useState('');
  const [fuelLevel, setFuelLevel] = useState(0.5);
  const [batteryPercent, setBatteryPercent] = useState<number | null>(null);
  const [testDriveNeeded, setTestDriveNeeded] = useState(false);
  const [protectiveCovers, setProtectiveCovers] = useState(true);
  const [warrantyManual, setWarrantyManual] = useState(false);
  const [hasBed, setHasBed] = useState(false);
  const [hasMarineCover, setHasMarineCover] = useState(false);

  // Respostas de Checklist
  const [answers, setAnswers] = useState<Record<string, { status: ItemCheckStatus; obs: string }>>({});

  // Condições de Pneus/Rodas
  const [tiresNotes, setTiresNotes] = useState('');

  // Fotos
  const [photos, setPhotos] = useState<{ category: string; file_url: string; description?: string }[]>([]);

  // Assinatura e Entrada
  const [entrySignature, setEntrySignature] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [entryTime, setEntryTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    if (user?.name && !consultantName) {
      setConsultantName(user.name);
    }
  }, [user, consultantName]);

  useEffect(() => {
    if (!token) return;
    // Carregar clientes e veículos existentes
    fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : []));

    fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setVehicles(Array.isArray(data) ? data : []));

    // Carregar itens oficiais do checklist
    fetch('/api/checklist-items', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((items: any[]) => {
        setTemplateItems(items);
        const initial: Record<string, { status: ItemCheckStatus; obs: string }> = {};
        items.forEach((it) => {
          initial[it.id] = { status: 'S', obs: '' };
        });
        setAnswers(initial);
      });
  }, [token]);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setClientPhone(client.phone);
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const v = vehicles.find((item) => item.id === vehicleId);
    if (v) {
      setVehiclePlate(v.plate);
      setVehicleModel(v.model);
      setVehicleColor(v.color);
      setVehicleKm(v.km);
      setVehicleYearModel(v.year_model);
      if (v.client_id) handleSelectClient(v.client_id);
    }
  };

  const handleAddDamage = (dmg: DamageMarkingData) => {
    setDamages((prev) => [...prev, dmg]);
  };

  const handleRemoveDamage = (index: number) => {
    setDamages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleBelonging = (item: string) => {
    setSelectedBelongings((prev) =>
      prev.includes(item) ? prev.filter((b) => b !== item) : [...prev, item]
    );
  };

  const validateStep1 = (): boolean => {
    setFormError(null);

    if (!osNumber.trim()) {
      const err = 'Informe o Número da O.S. na Etapa 1.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    if (!consultantName.trim()) {
      const err = 'Informe o nome do Consultor / Vistoriador.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    if (!clientName.trim()) {
      const err = 'Informe o Nome Completo do Cliente.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    if (!clientPhone.trim()) {
      const err = 'Informe o Telefone de Contato do Cliente.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    if (!vehiclePlate.trim()) {
      const err = 'Informe a Placa do Veículo.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    if (!vehicleModel.trim()) {
      const err = 'Informe o Modelo do Veículo.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    if (!vehicleColor.trim()) {
      const err = 'Informe a Cor do Veículo.';
      setFormError(err);
      showError(err, 'Campo Obrigatório');
      return false;
    }
    return true;
  };

  const handleNextStep1 = () => {
    console.log('[FixCar]: Clicou em Próximo na Etapa 1');
    if (validateStep1()) {
      setFormError(null);
      setCurrentStep(2);
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep > 1 && !validateStep1()) {
      return;
    }
    setFormError(null);
    setCurrentStep(targetStep);
  };

  const handleAnswerChange = (itemId: string, status: ItemCheckStatus) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setPhotos((prev) => [...prev, { category: 'CARROCERIA', file_url: data.url, description: file.name }]);
          showSuccess('Foto anexada com sucesso!', 'Evidência Fotográfica');
        } else {
          showError(data.error || 'Erro no upload da foto.');
        }
      })
      .catch((err) => showError('Erro de conexão no upload da foto.'));
  };

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
    setEntryDate(clean);
  };

  const handleTimeChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      clean = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    setEntryTime(clean);
  };

  const handleSubmitFinal = async () => {
    if (!token) {
      showError('Sessão expirada. Faça login novamente.');
      return;
    }

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    if (!isValidDateBR(entryDate)) {
      showError('Informe uma data de entrada válida no formato DD/MM/AAAA (ex: 11/08/2026).', 'Data Inválida');
      return;
    }

    if (!isValidTime(entryTime)) {
      showError('Informe um horário de entrada válido no formato HH:MM (ex: 14:30).', 'Horário Inválido');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar Cliente se não selecionado
      let finalClientId = selectedClientId;
      if (!finalClientId) {
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: clientName, phone: clientPhone }),
        });
        const createdClient = await clientRes.json();
        if (!clientRes.ok) {
          showError(createdClient.error || 'Erro ao cadastrar cliente');
          setLoading(false);
          return;
        }
        finalClientId = createdClient.id;
      }

      // 2. Criar Veículo se não selecionado
      let finalVehicleId = selectedVehicleId;
      if (!finalVehicleId) {
        const vehicleRes = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            client_id: finalClientId,
            plate: vehiclePlate,
            model: vehicleModel,
            year_model: vehicleYearModel || '2023/2024',
            color: vehicleColor || 'Prata',
            km: Number(vehicleKm) || 0,
          }),
        });
        const createdVehicle = await vehicleRes.json();
        if (!vehicleRes.ok) {
          showError(createdVehicle.error || 'Erro ao cadastrar veículo');
          setLoading(false);
          return;
        }
        finalVehicleId = createdVehicle.id;
      }

      // 3. Montar Respostas do Checklist
      const formattedAnswers = templateItems.map((item) => ({
        category: item.category,
        item_name: item.name,
        status: answers[item.id]?.status || 'S',
        observation: answers[item.id]?.obs || null,
      }));

      // 4. Montar Pertences
      const allBelongings = [...selectedBelongings];
      if (otherBelongings.trim()) allBelongings.push(`Outros: ${otherBelongings.trim()}`);

      // 5. Salvar Inspeção Completa
      const payload = {
        os_number: osNumber,
        client_id: finalClientId,
        vehicle_id: finalVehicleId,
        consultant_name: consultantName || user?.name || 'Vistoriador',
        is_driver_the_scheduler: isDriverTheScheduler,
        status: 'FINALIZADO',
        fuel_level: fuelLevel,
        battery_lev_percent: batteryPercent,
        test_drive_needed: testDriveNeeded,
        protective_covers_placed: protectiveCovers,
        warranty_manual_requested: warrantyManual,
        has_bed: hasBed,
        has_marine_cover: hasMarineCover,
        belongings: allBelongings,
        bodywork_notes: bodyworkNotes,
        tires_notes: tiresNotes,
        entry_signature: entrySignature,
        entry_date: entryDate,
        entry_time: entryTime,
        terms_accepted: true,
        answers: formattedAnswers,
        damage_markings: damages,
        photos: photos,
      };

      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        showSuccess(`Inspeção ${data.os_number} finalizada e laudo gerado com sucesso!`, 'Vistoria Concluída');
        setTimeout(() => {
          router.push(`/inspecoes/${data.id}/laudo`);
        }, 600);
      } else {
        showError(data.error || 'Erro ao finalizar inspeção.');
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      showError('Erro de conexão ao salvar inspeção.');
    }
  };

  const steps = [
    { num: 1, label: 'Identificação & Veículo' },
    { num: 2, label: 'Blueprint & Carroceria' },
    { num: 3, label: 'Itens do Checklist' },
    { num: 4, label: 'Inspeção Final & Pneus' },
    { num: 5, label: 'Fotos & Assinatura' },
  ];

  return (
    <AppLayout requiredRoles={['ADMIN', 'INSPETOR']}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Wizard Steps Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div
                  onClick={() => handleStepClick(s.num)}
                  className={`flex items-center gap-2 cursor-pointer shrink-0 ${
                    currentStep === s.num
                      ? 'text-sky-600 font-extrabold'
                      : currentStep > s.num
                      ? 'text-emerald-600 font-bold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === s.num
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30 ring-4 ring-sky-100'
                        : currentStep > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span className="text-xs hidden md:inline">{s.label}</span>
                </div>
                {idx < steps.length - 1 && <div className="h-0.5 w-6 sm:w-12 bg-slate-200 shrink-0 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Banner de Erro Inline para Feedback Instantâneo na Página */}
        {formError && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-500 text-red-800 text-sm font-bold shadow-lg animate-bounce">
            <XCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <span className="block text-xs uppercase font-extrabold text-red-600">Atenção ao preenchimento:</span>
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-500 hover:text-red-700 p-1 text-xs font-extrabold"
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: Identificação & Veículo */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Car className="h-5 w-5 text-sky-600" />
              Etapa 1: Dados da Ordem de Serviço, Cliente e Veículo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº O.S. / Laudo *</label>
                <input
                  type="text"
                  required
                  value={osNumber}
                  onChange={(e) => {
                    setOsNumber(e.target.value);
                    setFormError(null);
                  }}
                  className={`w-full text-xs font-bold rounded-xl border px-3.5 py-2.5 focus:border-sky-500 ${
                    !osNumber.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultor / Vistoriador *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do consultor"
                  value={consultantName}
                  onChange={(e) => {
                    setConsultantName(e.target.value);
                    setFormError(null);
                  }}
                  className={`w-full text-xs rounded-xl border px-3.5 py-2.5 focus:border-sky-500 ${
                    !consultantName.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDriverTheScheduler}
                    onChange={(e) => setIsDriverTheScheduler(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span>Condutor é quem fez o agendamento?</span>
                </label>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dados do Cliente</h3>
                {clients.length > 0 && (
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="text-xs rounded-lg border border-slate-300 px-2 py-1 bg-slate-50"
                  >
                    <option value="">Ou selecione um cliente existente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo do Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setFormError(null);
                    }}
                    className={`w-full text-xs rounded-xl border px-3.5 py-2.5 ${
                      !clientName.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone de Contato *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      setFormError(null);
                    }}
                    className={`w-full text-xs rounded-xl border px-3.5 py-2.5 ${
                      !clientPhone.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Dados do Veículo */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dados do Veículo</h3>
                {vehicles.length > 0 && (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => handleSelectVehicle(e.target.value)}
                    className="text-xs rounded-lg border border-slate-300 px-2 py-1 bg-slate-50"
                  >
                    <option value="">Ou selecione um veículo existente...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate} - {v.model}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="ABC-1D23"
                    value={vehiclePlate}
                    onChange={(e) => {
                      setVehiclePlate(e.target.value.toUpperCase());
                      setFormError(null);
                    }}
                    className={`w-full text-xs font-bold uppercase rounded-xl border px-3.5 py-2.5 text-sky-900 ${
                      !vehiclePlate.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Veículo / Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Corolla XEi 2.0"
                    value={vehicleModel}
                    onChange={(e) => {
                      setVehicleModel(e.target.value);
                      setFormError(null);
                    }}
                    className={`w-full text-xs rounded-xl border px-3.5 py-2.5 ${
                      !vehicleModel.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Prata"
                    value={vehicleColor}
                    onChange={(e) => {
                      setVehicleColor(e.target.value);
                      setFormError(null);
                    }}
                    className={`w-full text-xs rounded-xl border px-3.5 py-2.5 ${
                      !vehicleColor.trim() && formError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">KM Atual *</label>
                  <input
                    type="number"
                    value={vehicleKm}
                    onChange={(e) => setVehicleKm(Number(e.target.value))}
                    className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3.5 py-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNextStep1}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md transition"
              >
                Próximo: Blueprint & Carroceria
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Blueprint & Carroceria */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Etapa 2: Carroceria, Blueprint de Avarias e Pertences
            </h2>

            {/* Blueprint Interativo */}
            <VehicleBlueprint
              damages={damages}
              onAddDamage={handleAddDamage}
              onRemoveDamage={handleRemoveDamage}
            />

            {/* Observações da Carroceria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações Adicionais da Carroceria:
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes adicionais de funilaria, pintura, riscos ou amassados..."
                value={bodyworkNotes}
                onChange={(e) => setBodyworkNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:border-sky-500"
              />
            </div>

            {/* Pertences Deixados */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-xl">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Verificar existência de itens pessoais no veículo (PERTENCES):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PERTENCES_OPTIONS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBelongings.includes(item)}
                      onChange={() => toggleBelonging(item)}
                      className="rounded text-sky-600 h-4 w-4"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Outros pertences deixados..."
                  value={otherBelongings}
                  onChange={(e) => setOtherBelongings(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white"
                />
              </div>
            </div>

            {/* Combustível e Bateria */}
            <FuelGauge
              value={fuelLevel}
              onChange={setFuelLevel}
              batteryPercent={batteryPercent}
              onBatteryChange={setBatteryPercent}
            />

            {/* Opções Iniciais Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={protectiveCovers}
                  onChange={(e) => setProtectiveCovers(e.target.checked)}
                  className="rounded text-sky-600 h-4 w-4"
                />
                <span>Colocar as capas de proteção</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={warrantyManual}
                  onChange={(e) => setWarrantyManual(e.target.checked)}
                  className="rounded text-sky-600 h-4 w-4"
                />
                <span>Solicitar Manual de Garantia</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBed}
                  onChange={(e) => setHasBed(e.target.checked)}
                  className="rounded text-sky-600 h-4 w-4"
                />
                <span>Caçamba (Pick-up / Utilitário)</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMarineCover}
                  onChange={(e) => setHasMarineCover(e.target.checked)}
                  className="rounded text-sky-600 h-4 w-4"
                />
                <span>Capota Marítima</span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md"
              >
                Próximo: Itens do Checklist
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Itens do Checklist */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Etapa 3: Checagem dos Itens do Checklist</h2>
                <p className="text-xs text-slate-500">Marque o status correspondente para cada componente</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">S (Sim/OK)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">N (Não Tem)</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">A (Avariado)</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800">I (Incompleto)</span>
              </div>
            </div>

            {/* Categorias */}
            {['INTERNO', 'FRENTE_LATERAIS', 'TRASEIRA', 'TAMPAS_FLUIDOS_OUTROS'].map((cat) => {
              const items = templateItems.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              const formattedTitle =
                cat === 'TAMPAS_FLUIDOS_OUTROS'
                  ? 'TAMPAS FLUIDOS - OUTROS'
                  : cat === 'FRENTE_LATERAIS'
                  ? 'FRENTE / LATERAIS'
                  : cat;

              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
                    {formattedTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => {
                      const curStatus = answers[item.id]?.status || 'S';
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                        >
                          <span className="font-semibold text-slate-800 truncate pr-2">{item.name}</span>
                          <div className="flex gap-1 shrink-0">
                            {(['S', 'N', 'A', 'I'] as ItemCheckStatus[]).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleAnswerChange(item.id, st)}
                                className={`w-7 h-7 rounded-lg text-xs font-extrabold transition ${
                                  curStatus === st
                                    ? st === 'S'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : st === 'N'
                                      ? 'bg-slate-600 text-white'
                                      : st === 'A'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-purple-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md"
              >
                Próximo: Inspeção Final & Pneus
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Inspeção Final & Pneus */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">
              Etapa 4: Inspeção Final (Estático & Rodagem) e Pneus
            </h2>

            {/* Estático & Rodagem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg mb-2">
                  Inspeção Estática
                </h3>
                <div className="space-y-1.5">
                  {templateItems
                    .filter((i) => i.category === 'ESTATICO')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleAnswerChange(item.id, answers[item.id]?.status === 'S' ? 'A' : 'S')
                          }
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            answers[item.id]?.status === 'S'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {answers[item.id]?.status === 'S' ? '✓ OK' : '✕ Avariado'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg mb-2">
                  Teste de Rodagem
                </h3>
                <div className="space-y-1.5">
                  {templateItems
                    .filter((i) => i.category === 'RODAGEM')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleAnswerChange(item.id, answers[item.id]?.status === 'S' ? 'A' : 'S')
                          }
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            answers[item.id]?.status === 'S'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {answers[item.id]?.status === 'S' ? '✓ OK' : '✕ Avariado'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Observações de Pneus e Rodas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações de Pneus, Calotas e Rodas de Liga Leve:
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Pneu dianteiro direito com desgaste irregular, rodas sem amassados..."
                value={tiresNotes}
                onChange={(e) => setTiresNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:border-sky-500"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 shadow-md"
              >
                Próximo: Fotos & Assinatura
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Fotos & Assinatura */}
        {currentStep === 5 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">
              Etapa 5: Evidências Fotográficas e Assinatura Digital
            </h2>

            {/* Upload de Fotos */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fotos de Evidências do Veículo / Avarias:
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer border border-slate-300 transition">
                  <Camera className="h-4 w-4 text-sky-600" />
                  <span>Adicionar Foto</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden group">
                      <img src={p.file_url} alt={p.description || 'Foto'} className="w-full h-24 object-cover" />
                      <div className="p-1 text-[10px] text-slate-600 truncate bg-slate-50">{p.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assinatura Digital de Entrada */}
            <div className="pt-4 border-t border-slate-200">
              <SignaturePad
                value={entrySignature}
                onChange={setEntrySignature}
                label="Declaro ter DEIXADO o veículo acima nas condições informadas neste Checklist (Assinatura do Cliente):"
              />
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Data (Hoje):</label>
                  <input
                    type="text"
                    readOnly
                    value={entryDate}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-600 px-3 py-1.5 font-bold cursor-not-allowed select-none"
                    title="Data preenchida automaticamente com a data de hoje"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Hora (HH:MM) *:</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="HH:MM"
                    value={entryTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 font-bold focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Botão Finalizar */}
            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitFinal}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FileCheck className="h-5 w-5" />
                    Finalizar e Gerar Laudo Oficial
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
