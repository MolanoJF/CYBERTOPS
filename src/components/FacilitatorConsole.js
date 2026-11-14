'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  Globe
} from 'lucide-react';
import { CYBERTOP_PREMIUM_CONFIG } from '@/lib/config-premium';

export default function FacilitatorConsole({ 
  sessionData, 
  onRefresh,
  isSubmittingExternally,
  setIsSubmittingExternally
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });
  
  const timerIntervalRef = useRef(null);

  const isSubmitting = isSubmittingExternally !== undefined ? isSubmittingExternally : localIsSubmitting;
  const setIsSubmitting = setIsSubmittingExternally !== undefined ? setIsSubmittingExternally : setLocalIsSubmitting;

  const sessionId = sessionData?.id;
  const companyName = sessionData?.companyName;
  const industryKey = sessionData?.industryKey;
  const industryName = sessionData?.industryName;
  const countries = sessionData?.countries || [];
  const currentStep = sessionData?.currentStep;
  const stepNumber = currentStep !== undefined ? Number(currentStep) : 0;
  const dimensionScores = sessionData?.dimensionScores;
  const gci = sessionData?.gci;
  const dvs = sessionData?.dvs;
  const brs = sessionData?.brs;
  const stockPrice = sessionData?.stockPrice;
  const decisionLogs = sessionData?.decisionLogs || [];
  const redTeamLogs = sessionData?.redTeamLogs || [];
  const votes = sessionData?.votes || {};
  const isFinished = sessionData?.isFinished;

  // Retrieve details for current inject & decision
  const activeInject = (industryKey && stepNumber > 0)
    ? CYBERTOP_PREMIUM_CONFIG.injects[industryKey]?.[stepNumber - 1]
    : null;
  const activeDecision = stepNumber > 0
    ? CYBERTOP_PREMIUM_CONFIG.decisions.find(d => Number(d.phase) === stepNumber)
    : null;

  // Reset local state when step changes
  useEffect(() => {
    const handleStepChange = () => {
      setSelectedOption(null);
      setIsSubmitting(false);
      if (activeDecision) {
        setTimerSeconds(activeDecision.sla);
        setElapsedTime(0);
        setIsTimerRunning(false);
      } else {
        setTimerSeconds(0);
        setElapsedTime(0);
        setIsTimerRunning(false);
      }
      setFeedbackMsg({ text: '', type: '' });
    };

    // Defer state updates to avoid synchronous setState inside useEffect body
    const timeoutId = setTimeout(handleStepChange, 0);
    return () => clearTimeout(timeoutId);
  }, [stepNumber, activeDecision]);

  // Handle countdown timer
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  if (!sessionData) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-12 text-center">
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-secondary">Cargando consola del facilitador...</p>
      </div>
    );
  }

  // Format timer into MM:SS (supports negative seconds)
  const formatTimer = (totalSeconds) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? '-' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Adjust SLA time manually (override)
  const adjustSla = (amount) => {
    setTimerSeconds(prev => prev + amount);
  };

  // Phased reveal: reveal question & options to board and trigger timer
  const revealQuestion = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/session/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'showQuestion' })
      });
      if (res.ok) {
        await onRefresh();
        setIsTimerRunning(true); // Automatically start timer when question is revealed
      } else {
        showFeedback('Error al lanzar la pregunta.', 'error');
      }
    } catch (e) {
      console.error(e);
      showFeedback('Error de red al lanzar la pregunta.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send selected choice to database and advance step
  const submitDecision = async () => {
    if (activeDecision && !selectedOption) {
      showFeedback('Debe seleccionar una opción antes de avanzar.', 'error');
      return;
    }

    setIsSubmitting(true);
    setIsTimerRunning(false);
    setFeedbackMsg({ text: '', type: '' });

    try {
      const res = await fetch(`/api/session/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionChosen: selectedOption,
          responseTimeSeconds: elapsedTime
        })
      });

      if (res.ok) {
        showFeedback('Fase completada. Avanzando a la siguiente fase...', 'success');
        setTimeout(async () => {
          try {
            await onRefresh();
          } catch (refreshErr) {
            console.error('Error refreshing session data:', refreshErr);
          } finally {
            setIsSubmitting(false);
          }
        }, 1000);
      } else {
        let errMsg = 'Error al enviar decisión.';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (jsonErr) {
          console.error('Failed to parse error response JSON:', jsonErr);
        }
        showFeedback(errMsg, 'error');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      showFeedback('Error de red al enviar decisión.', 'error');
      setIsSubmitting(false);
    }
  };

  // Trigger a Red Team inject
  const triggerRedTeamInject = async (injectKey) => {
    setFeedbackMsg({ text: '', type: '' });
    try {
      const res = await fetch(`/api/session/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ injectKey })
      });

      if (res.ok) {
        onRefresh();
        showFeedback(`Inyección Red Team "${CYBERTOP_PREMIUM_CONFIG.redTeam[injectKey].name}" aplicada con éxito.`, 'success');
      } else {
        const err = await res.json();
        showFeedback(err.error || 'Error aplicando inyección.', 'error');
      }
    } catch (e) {
      console.error(e);
      showFeedback('Error de red al aplicar inyección.', 'error');
    }
  };

  const showFeedback = (text, type) => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(prev => prev.text === text ? { text: '', type: '' } : prev);
    }, 4000);
  };

  // Check if a Red Team inject is already triggered
  const isInjectTriggered = (injectKey) => {
    return redTeamLogs.some(log => log.injectKey === injectKey);
  };

  // Helper to get vote stats
  const activeVotes = votes ? votes[stepNumber] : null;
  const totalVotes = activeVotes ? (activeVotes.A + activeVotes.B + activeVotes.C) : 0;
  const getVotePercent = (opt) => {
    if (totalVotes === 0) return 0;
    return Math.round((activeVotes[opt] / totalVotes) * 100);
  };

  return (
    <div className="container">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/LogoCyberes.svg" alt="Cyberes Logo" style={{ height: '32px' }} />
          <div className="brand-logo">CYBER<span>TOP</span></div>
          <span className="confidential-tag">Facilitador</span>
        </div>
        <div className="simulation-metadata">
          <div className="metadata-item">Empresa: <span>{companyName}</span></div>
          <div className="metadata-item">Industria: <span>{industryName}</span></div>
          <div className="metadata-item">Fase actual: <span>{isFinished ? 'Finalizado' : `${stepNumber} / 8`}</span></div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.open(`/projector?id=${sessionId}`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Globe className="w-4 h-4" /> Proyectar Tablero
          </button>
          <button className="btn btn-secondary" onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw className="w-4 h-4" /> Recargar Estado
          </button>
        </div>
      </div>

      {feedbackMsg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: feedbackMsg.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
          border: `1px solid ${feedbackMsg.type === 'success' ? 'var(--status-green)' : 'var(--status-red)'}`,
          color: feedbackMsg.type === 'success' ? 'var(--status-green)' : 'var(--status-red)',
          marginBottom: '20px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {feedbackMsg.text}
        </div>
      )}

      <div className="facilitator-flex-layout">
        
        {/* LEFT COLUMN: ACTIVE SCENARIO CONTROL */}
        <div className="facilitator-control-card">
          
          {/* Active Inject Panel */}
          {activeInject ? (
            <div className="glass-card highlighted">
              <span className="current-inject-title">Fase {stepNumber} de 8 - Evento Activo</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 12px 0', color: 'var(--text-primary)' }}>
                {activeInject.title}
              </h2>
              <p className="event-details-text" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 0 }}>
                {activeInject.desc}
              </p>
            </div>
          ) : isFinished ? (
            <div className="glass-card highlighted" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle className="w-16 h-16 text-green-400" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>¡Simulación Finalizada!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                La junta directiva de {companyName} ha completado todas las fases de crisis.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Link href={`/projector?id=${sessionId}`} className="btn btn-primary">Ver Scorecard Final</Link>
                <Link href="/" className="btn btn-secondary">Crear Nueva Sesión</Link>
              </div>
            </div>
          ) : (
            <div className="glass-card highlighted" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <Play className="w-16 h-16 text-cyan-400 animate-pulse" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Preparado para Iniciar
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', maxWidth: '450px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                La sesión de simulación para <strong>{companyName}</strong> está lista. Haga clic a continuación para presentar el primer Inject a la junta directiva y comenzar.
              </p>
              <button 
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={submitDecision}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto', fontSize: '1.05rem', padding: '12px 24px' }}
              >
                {isSubmitting ? 'Iniciando...' : 'Iniciar Simulación (Fase 1)'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Active Decision Options */}
          {!isFinished && activeInject && (
            <div className="glass-card">
              {activeDecision ? (
                <>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                    {activeDecision.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.5 }}>
                    {activeDecision.desc}
                  </p>

                  {!sessionData.showQuestion ? (
                    <div style={{ padding: '24px 20px', textAlign: 'center', background: 'rgba(0, 229, 255, 0.03)', borderRadius: '10px', border: '1px dashed rgba(0, 229, 255, 0.2)' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                        La pregunta y las opciones de decisión están ocultas actualmente en el tablero de la Junta.
                      </p>
                      <button 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        onClick={revealQuestion}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', fontSize: '1rem', padding: '10px 20px' }}
                      >
                        <Play className="w-4 h-4 fill-current" /> Lanzar Pregunta a la Junta
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="decision-options-container">
                        {activeDecision.options.map(opt => (
                          <div 
                            key={opt.key} 
                            className={`decision-option-card ${selectedOption === opt.key ? 'selected' : ''}`}
                            onClick={() => setSelectedOption(opt.key)}
                          >
                            <div className="decision-option-letter">{opt.key}</div>
                            <div className="decision-option-body">
                              <p className="decision-option-text">{opt.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Opción Seleccionada: <strong>{selectedOption ? `Opción ${selectedOption}` : 'Ninguna'}</strong>
                          </span>
                        </div>
                        <button 
                          className="btn btn-primary"
                          disabled={!selectedOption || isSubmitting}
                          onClick={submitDecision}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          {isSubmitting ? 'Procesando...' : 'Registrar Decisión y Avanzar'} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <AlertTriangle className="w-12 h-12 text-yellow-400" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>
                    Esta fase (Fase {stepNumber}) no requiere decisión fiduciaria directa de la Junta.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', maxWidth: '450px', margin: '0 auto 24px auto' }}>
                    Utilice este momento para debatir el impacto operativo y las implicaciones estratégicas de los eventos anteriores.
                  </p>
                  <button 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    onClick={submitDecision}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                  >
                    {isSubmitting ? 'Procesando...' : 'Avanzar a Siguiente Fase'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Decision logs history in console */}
          {decisionLogs.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Historial de Decisiones Tomadas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {decisionLogs.map((log) => (
                  <div key={log.decisionId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
                    <div>
                      <strong>Fase {log.decisionId}</strong>: {log.title.replace('DECISIÓN ' + log.decisionId + ' – ', '')}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Opción Elegida: <span style={{ color: 'var(--accent-cyan)' }}>{log.optionChosen}</span> | Tiempo: {log.responseTimeSeconds}s (SLA {log.sla}s)
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={`scorecard-badge ${log.dvs < 60 ? 'red' : log.dvs <= 80 ? 'yellow' : 'green'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        DVS: {log.dvs}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: TIMER, CONSENSUS AND RED TEAM */}
        <div className="facilitator-control-card">
          
          {/* Clock Controller */}
          {!isFinished && activeInject && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Clock className="w-5 h-5 text-cyan-400" /> Cronómetro de Decisión (SLA)
              </h3>
              
              <div className="timer-section" style={{ marginBottom: '16px' }}>
                <div>
                  <span className="timer-label">Tiempo Restante</span>
                  <div className={`timer-display ${timerSeconds < 0 ? 'exceeded' : ''}`}>
                    {formatTimer(timerSeconds)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="timer-label">Tiempo Transcurrido</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {elapsedTime}s
                  </div>
                </div>
              </div>

              {/* Timer operations */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)} 
                  className={`btn ${isTimerRunning ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Iniciar
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setIsTimerRunning(false);
                    if (activeDecision) {
                      setTimerSeconds(activeDecision.sla);
                      setElapsedTime(0);
                    }
                  }} 
                  className="btn btn-secondary"
                  title="Reiniciar Cronómetro"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* SLA Adjusters (Overrides) */}
              <div style={{ display: 'flex', justifyItems: 'space-between', gap: '8px' }}>
                <button onClick={() => adjustSla(30)} className="btn btn-secondary" style={{ flexGrow: 1, padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Plus className="w-3 h-3" /> 30s SLA
                </button>
                <button onClick={() => adjustSla(-30)} className="btn btn-secondary" style={{ flexGrow: 1, padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Minus className="w-3 h-3" /> 30s SLA
                </button>
              </div>
            </div>
          )}



          {/* Red Team Inject Panel */}
          {!isFinished && activeInject && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ShieldAlert className="w-5 h-5" /> Inyecciones Inesperadas (Red Team)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                Despliegue incidentes imprevistos para aumentar la tensión en la Junta directiva.
              </p>
              
              <div className="red-team-grid">
                {Object.keys(CYBERTOP_PREMIUM_CONFIG.redTeam).map(key => {
                  const inject = CYBERTOP_PREMIUM_CONFIG.redTeam[key];
                  const triggered = isInjectTriggered(key);
                  return (
                    <button
                      key={key}
                      onClick={() => triggerRedTeamInject(key)}
                      disabled={triggered}
                      className="red-team-btn"
                      style={{ opacity: triggered ? 0.4 : 1 }}
                      title={inject.desc}
                    >
                      <div className="rt-title">
                        {triggered ? '✓ ' : '⚡ '} {inject.name}
                      </div>
                      <div className="rt-desc">
                        {triggered ? 'Aplicado' : 'Trigger'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {redTeamLogs.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Inyecciones Aplicadas:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {redTeamLogs.map(log => (
                      <span 
                        key={log.injectKey} 
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 8px', 
                          background: 'rgba(255, 23, 68, 0.1)', 
                          border: '1px solid rgba(255,23,68,0.3)', 
                          color: 'var(--status-red)', 
                          borderRadius: '4px' 
                        }}
                      >
                        {log.name} (Fase {log.step})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dimension score gauges breakdown on facilitator panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Índice GCI Global: <span style={{ color: gci > 55 ? 'var(--status-red)' : 'var(--status-green)' }}>{Math.round(gci)}</span> | BRS: <span style={{ color: 'var(--accent-cyan)' }}>{brs}</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
              {Object.keys(dimensionScores || {}).map(key => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dimensionScores[key]}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
