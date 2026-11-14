'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FacilitatorConsole from '@/components/FacilitatorConsole';
import { RefreshCw, AlertTriangle } from 'lucide-react';

function FacilitatorPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/${sessionId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Sesión no encontrada.');
        }
        throw new Error('Error al conectar con la base de datos de simulación.');
      }
      const data = await res.json();
      setSessionData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión.');
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setError('Falta el ID de sesión. Por favor inicie una simulación.');
      return;
    }

    // Defer initial fetch to avoid synchronous state update inside effect
    const timerId = setTimeout(() => {
      fetchSession();
    }, 0);

    // Polling interval (2000ms) to sync external votes or actions,
    // but only when we are NOT in the process of submitting a decision.
    let interval;
    if (!isSubmitting) {
      interval = setInterval(fetchSession, 2000);
    }

    return () => {
      clearTimeout(timerId);
      if (interval) clearInterval(interval);
    };
  }, [sessionId, fetchSession, isSubmitting]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-height-100vh p-8 text-center" style={{ minHeight: '80vh' }}>
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Error</h2>
        <p className="text-secondary" style={{ maxWidth: '500px', marginBottom: '24px' }}>{error}</p>
        <Link href="/" className="btn btn-primary">Volver al Inicio</Link>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-height-100vh p-8 text-center" style={{ minHeight: '80vh' }}>
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-secondary">Conectando consola del facilitador...</p>
      </div>
    );
  }

  return (
    <FacilitatorConsole 
      sessionData={sessionData} 
      onRefresh={fetchSession}
      isSubmittingExternally={isSubmitting}
      setIsSubmittingExternally={setIsSubmitting}
    />
  );
}

export default function FacilitatorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-height-100vh p-8 text-center" style={{ minHeight: '80vh' }}>
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-secondary">Inicializando consola del facilitador...</p>
      </div>
    }>
      <FacilitatorPageContent />
    </Suspense>
  );
}
