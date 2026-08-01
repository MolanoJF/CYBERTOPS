'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Settings, Info, Play, ExternalLink } from 'lucide-react';
import { CYBERTOP_PREMIUM_CONFIG } from '@/lib/config-premium';

export default function Home() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [industryKey, setIndustryKey] = useState('BANCA');
  const [countries, setCountries] = useState(['LATAM']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdSessionId, setCreatedSessionId] = useState('');

  const handleCountryChange = (countryCode) => {
    if (countries.includes(countryCode)) {
      // Keep at least one country
      if (countries.length > 1) {
        setCountries(countries.filter(c => c !== countryCode));
      }
    } else {
      setCountries([...countries, countryCode]);
    }
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Por favor, ingrese el nombre de la empresa.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industryKey,
          countries
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedSessionId(data.sessionId);
        // Redirect facilitator automatically to console
        router.push(`/facilitator?id=${data.sessionId}`);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Error al iniciar la sesión.');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Error de red al conectar con el servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
          CYBER<span style={{ color: 'var(--accent-cyan)' }}>TOP</span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px' }}>
          Digital Decision Board — Crisis Simulation Cockpit
        </p>
      </div>

      <div className="glass-card highlighted">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
          <Settings className="w-6 h-6 text-cyan-400" /> Configuración del Wargame
        </h2>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 23, 68, 0.15)',
            border: '1px solid var(--status-red)',
            color: 'var(--status-red)',
            marginBottom: '20px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {errorMsg}
          </div>
        )}

        {!createdSessionId ? (
          <form onSubmit={handleLaunch} className="setup-card">
            
            {/* Company Input */}
            <div className="form-group">
              <label htmlFor="company">Nombre de la Compañía Evaluada</label>
              <input 
                id="company"
                type="text" 
                className="form-input" 
                placeholder="Ej. Grupo Financiero Continental"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={45}
                required
              />
            </div>

            {/* Industry Selection */}
            <div className="form-group">
              <label htmlFor="industry">Industria / Sector de Negocio</label>
              <select 
                id="industry"
                className="facilitator-select" 
                value={industryKey}
                onChange={(e) => setIndustryKey(e.target.value)}
              >
                {Object.keys(CYBERTOP_PREMIUM_CONFIG.industries).map(key => (
                  <option key={key} value={key} style={{ background: 'var(--bg-deep-space)', color: '#fff' }}>
                    {CYBERTOP_PREMIUM_CONFIG.industries[key].name}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Esto altera las ponderaciones relativas de las 12 dimensiones de riesgo en el índice GCI.
              </span>
            </div>

            {/* Country Checkboxes */}
            <div className="form-group">
              <label>Jurisdicciones / Entes Reguladores Activos</label>
              <div className="checkbox-group">
                <label className="checkbox-label" style={{ borderColor: countries.includes('LATAM') ? 'var(--accent-cyan)' : 'var(--border-glass)' }}>
                  <input 
                    type="checkbox" 
                    checked={countries.includes('LATAM')} 
                    onChange={() => handleCountryChange('LATAM')}
                  />
                  <span>LATAM (Sup. Financiera)</span>
                </label>
                <label className="checkbox-label" style={{ borderColor: countries.includes('US') ? 'var(--accent-cyan)' : 'var(--border-glass)' }}>
                  <input 
                    type="checkbox" 
                    checked={countries.includes('US')} 
                    onChange={() => handleCountryChange('US')}
                  />
                  <span>EE.UU. (SEC Compliance)</span>
                </label>
                <label className="checkbox-label" style={{ borderColor: countries.includes('EU') ? 'var(--accent-cyan)' : 'var(--border-glass)' }}>
                  <input 
                    type="checkbox" 
                    checked={countries.includes('EU')} 
                    onChange={() => handleCountryChange('EU')}
                  />
                  <span>Europa (GDPR Audit)</span>
                </label>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Las regulaciones de EE.UU. y Europa aumentan severamente las sanciones de multas fiduciarias (1.2x - 1.25x).
              </span>
            </div>

            {/* Launch button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{ 
                marginTop: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px', 
                fontSize: '1rem',
                padding: '12px'
              }}
            >
              <Play className="w-5 h-5 fill-current" /> {isSubmitting ? 'Iniciando Simulación...' : 'Iniciar Sesión Inmersiva'}
            </button>

          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h3 style={{ color: 'var(--status-green)', marginBottom: '16px' }}>✓ Sesión Inicializada Exitosamente</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Utilice los siguientes accesos directos para la configuración de dos monitores (facilitador en pantalla privada, proyector en la pantalla de la Junta):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              <a 
                href={`/facilitator?id=${createdSessionId}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Pantalla Facilitador <ExternalLink className="w-4 h-4" />
              </a>
              <a 
                href={`/projector?id=${createdSessionId}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Pantalla Proyector Board <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Corporate guidelines */}
      <div className="glass-card" style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Info className="w-6 h-6 text-blue-400 flex-shrink-0" style={{ marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Instrucciones para Facilitación Boardroom CYBER-ES
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Abra la consola de facilitación en su laptop/dispositivo local privado. Proyecte la pantalla del Proyector en la pantalla principal de la sala de juntas. El cronómetro y las inyecciones de amenazas sorpresivas (Red Team) son invisibles para la junta directiva hasta que son aplicadas.
          </p>
        </div>
      </div>
    </div>
  );
}
