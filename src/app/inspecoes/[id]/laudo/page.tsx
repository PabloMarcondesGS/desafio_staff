'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import OfficialChecklistDocument from '@/components/report/OfficialChecklistDocument';

export default function InspectionReportPage() {
  const { token } = useAuth();
  const params = useParams();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;
    fetch(`/api/inspections/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInspection(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar laudo:', err);
        setLoading(false);
      });
  }, [token, params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!inspection || inspection.error) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-red-500">
          Laudo de inspeção não encontrado.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <OfficialChecklistDocument inspection={inspection} />
    </AppLayout>
  );
}
