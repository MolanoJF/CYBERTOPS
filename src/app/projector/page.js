'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProjectorDashboard from '@/components/ProjectorDashboard';
import { RefreshCw, AlertTriangle } from 'lucide-react';

function ProjectorPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Falta el parámetro de ID de sesión. Inicie la simulación desde la página principal.');
      return;
    }

    let isSubscribed = true;
    
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/session/${sessionId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Sesión no encontrada en el sistema.');
          }
          throw new Error('Error al conectar con la base de datos de simulación.');
        }
        const data = await res.json();
        if (isSubscribed) {
          setSessionData(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isSubscribed) {
          setError(err.message || 'Error de conexión.');
        }
      }
    };

    // Immediate initial fetch
    fetchSession();

    // Short-polling sync loop (1000ms) for offline boardroom operation
    const interval = setInterval(fetchSession, 1000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-height-100vh p-8 text-center" style={{ minHeight: '80vh' }}>
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Error de Conexión</h2>
        <p className="text-secondary" style={{ maxWidth: '500px', marginBottom: '24px' }}>{error}</p>
        <Link href="/" className="btn btn-primary">Volver al Setup Principal</Link>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-height-100vh p-8 text-center" style={{ minHeight: '80vh' }}>
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-secondary">Conectando con el servidor de wargames...</p>
      </div>
    );
  }

  return <ProjectorDashboard sessionData={sessionData} />;
}

export default function ProjectorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-height-100vh p-8 text-center" style={{ minHeight: '80vh' }}>
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-secondary">Inicializando vistas del proyector...</p>
      </div>
    }>
      <ProjectorPageContent />
    </Suspense>
  );
}
