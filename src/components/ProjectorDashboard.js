'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  Shield, 
  Activity, 
  Globe, 
  Clock, 
  Users, 
  Award, 
  FileText, 
  Printer, 
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { CYBERTOP_PREMIUM_CONFIG } from '@/lib/config-premium';

const DIMENSION_NAMES = {
  GG: "Gobierno Global",
  MC: "Coordinación Multi-país",
  VD: "Velocidad de Decisión",
  CC: "Cohesión C-suite",
  GI: "Gestión de Inversionistas",
  ER: "Exposición Regulatoria",
  GR: "Gestión Reputacional",
  CG: "Continuidad Global",
  TI: "Terceros Internacionales",
  CR: "Cultura de Riesgo",
  RF: "Resiliencia Financiera",
  PJ: "Preparación de Junta"
};

// Social media reactions library matching steps and industries
const SOCIAL_TEMPLATES = {
  BANCA: {
    1: [
      { author: "CyberAlerts Central", handle: "@cyberalerts", text: "🚨 RUMOR: Registros de inteligencia de amenazas indican un escaneo coordinado en las pasarelas de transacciones SWIFT de bancos multinacionales." },
      { author: "Inversor Diario", handle: "@inversordiario", text: "Las acciones bancarias muestran una ligera volatilidad esta mañana. Rumores de alertas de red en segundo plano." }
    ],
    2: [
      { author: "AnonSec Global", handle: "@anonsec_gl", text: "Ellos creen que sus credenciales internas están seguras. Revisen los accesos de administración en LATAM, los estamos vigilando. 👀" },
      { author: "Security Wire", handle: "@secwire", text: "Analista de SOC reporta fuerza bruta activa en pasarelas VPN de una importante compañía financiera." }
    ],
    3: [
      { author: "Monica Perez", handle: "@monicap", text: "¿Por qué la app del banco dice \"Transferencias SWIFT temporalmente no disponibles\"? ¡Tengo que pagar mi factura! 😡" },
      { author: "Market Ticker", handle: "@marketticker", text: "ÚLTIMO MINUTO: Bloqueadas transferencias de alto valor en múltiples países. Entidades financieras principales fuera de línea para contención." }
    ],
    4: [
      { author: "Dark Web Leak", handle: "@darkwebleaks", text: "Filtración de CSV en línea: Más de 50,000 cuentas bancarias VIP con saldos filtrados. Objetivo confirmado. #CyberTop" },
      { author: "Finanz Legal", handle: "@finanzlegal", text: "Los riesgos de demandas colectivas se disparan para los bancos que no protegen los saldos de los clientes en la última brecha." }
    ],
    5: [
      { author: "Bloomberg Regulatory", handle: "@bloomberg_reg", text: "La SEC exige divulgación formal inmediata a los bancos afectados por el incidente SWIFT. El plazo de 4 días está corriendo." },
      { author: "Superintendencia", handle: "@super_finanzas", text: "Las autoridades locales ordenan equipos de auditoría para realizar verificación in-situ en los bancos afectados." }
    ],
    6: [
      { author: "Tech Threat", handle: "@techthreat", text: "Actualización de extorsión: Atacantes exigen $20 millones de dólares en BTC para descifrar archivos centrales del core bancario. El tiempo corre." },
      { author: "Fiduciary Trust", handle: "@fidtrustees", text: "Miembros de la junta se enfrentan a reclamos de responsabilidad fiduciaria si deciden pagar el rescate sin autorización legal." }
    ],
    7: [
      { author: "Cloud Outage Tracker", handle: "@cloud_out", text: "El proveedor de transacciones en la nube reporta falla mayor que afecta la autenticación de tokens. Los bancos están totalmente a ciegas." },
      { author: "Tech Crunch", handle: "@techcrunch", text: "Falla en dependencias de API SaaS. Incidente crítico de ciberseguridad repercute en la cadena de suministro global." }
    ],
    8: [
      { author: "Cibernético", handle: "@cibernetico", text: "Intentando reinicio de sistemas. Expertos advierten de malware latente en el firmware de los terminales. La recuperación sigue siendo altamente riesgosa." },
      { author: "CEO Insider", handle: "@ceo_insider", text: "Se reportan tensas reuniones de junta directiva. ¿Sobrevivirá el CEO a los efectos colaterales de la crisis de SWIFT?" }
    ]
  },
  SALUD: {
    1: [
      { author: "MedTech Security", handle: "@medtechsec", text: "🚨 Alerta: Escáneres de la cadena de suministro marcan un potencial día cero dirigido a las redes de distribución farmacéutica." }
    ],
    2: [
      { author: "BioHacker", handle: "@biohacker", text: "Archivos maestros de fórmulas de vacunas descargados. Las patentes propietarias ahora son de dominio público. Gracias por la falta de segmentación." }
    ],
    3: [
      { author: "Hospital Central", handle: "@hosp_alerts", text: "Ransomware congela sistemas de admisión de hospitales. Protocolos de triaje de emergencia activados. Volviendo al papel." }
    ],
    4: [
      { author: "El Pais Health", handle: "@elpais_health", text: "CRÍTICO: Cae la telemetría de monitores remotos de la UCI. Enfermeros pasan a revisiones manuales del pulso. ¡Vidas humanas en riesgo!" }
    ],
    5: [
      { author: "Ministerio de Salud", handle: "@min_salud", text: "Iniciamos auditoría regulatoria formal. Licencia del operador de hospital bajo revisión activa debido a riesgos para los pacientes." }
    ],
    6: [
      { author: "Ransom Informer", handle: "@ransom_inf", text: "Atacantes emiten ultimátum: $20M o los expedientes médicos de los pacientes serán publicados en redes Tor." }
    ],
    7: [
      { author: "Logistics Hub", handle: "@log_hub", text: "Distribuidores de oxígeno reportan retrasos en despachos. Fallaron las interfaces del sistema con el inventario central del hospital." }
    ],
    8: [
      { author: "Clinica Global", handle: "@clinicaglobal", text: "Parche de emergencia aplicado. Restaurando sistemas bajo cuarentena. Los riesgos de reinfección siguen siendo altos." }
    ]
  },
  TECNOLOGIA: {
    1: [
      { author: "DDoS Monitor", handle: "@ddosmon", text: "Ataque volumétrico masivo dirigido a resolvedores DNS globales. Proveedores de SaaS reportan latencia." }
    ],
    2: [
      { author: "Cloud Leaks", handle: "@cloudleaks", text: "Claves raíz de AWS encontradas en repositorio público. Repositorios maestros de código clonados por grupo de ciberamenazas." }
    ],
    3: [
      { author: "Outage Report", handle: "@outagereport", text: "Pasarelas de API caídas. Consolas de desarrolladores inaccesibles. Integraciones de Fortune 500 fallando globalmente." }
    ],
    4: [
      { author: "Enterprise Legal", handle: "@enterprise_legal", text: "Clientes de SaaS corporativos exigen compensaciones por brecha de SLA. Reclamaciones multimillonarias entrantes." }
    ],
    5: [
      { author: "GDPR Watch", handle: "@gdprwatch", text: "Reguladores de la UE lanzan investigación sobre la brecha en la base de datos de SaaS. Las multas podrían alcanzar el 4% de la facturación global." }
    ],
    6: [
      { author: "Hacker News Feed", handle: "@hn_feed", text: "Atacantes exigen $20 millones de dólares en BTC. Amenazan con publicar el código fuente maestro del repositorio. Gran exposición de IP." }
    ],
    7: [
      { author: "K8s Admin", handle: "@k8s_admin", text: "Plano de control comprometido. Clústeres de Kubernetes bloqueados. Nodos de respaldo globales eliminados." }
    ],
    8: [
      { author: "DevOps Global", handle: "@devops_gl", text: "Reconstruyendo imágenes de contenedores. Saneamiento de base de datos de tokens de sesión en curso para evitar secuestro de sesiones." }
    ]
  },
  OIL_GAS: {
    1: [
      { author: "Energy Alert", handle: "@energyalert", text: "Grupo de actores patrocinado por el estado escanea activamente vulnerabilidades de controladores SCADA en refinerías de energía." }
    ],
    2: [
      { author: "ICS Security", handle: "@ics_sec", text: "Credenciales de VPN filtradas. Se accedió a terminales de mantenimiento remoto desde direcciones IP externas no corporativas." }
    ],
    3: [
      { author: "Pipeline Operator", handle: "@pipe_operator", text: "Telemetría SCADA del gasoducto perdida. Indicadores de flujo reportan línea plana. Válvulas de control no responden." }
    ],
    4: [
      { author: "Eco Green Press", handle: "@ecogreen", text: "Rumores: Aumento de presión en ducto de gas obliga al cierre físico preventivo. ¿Riesgo de fugas ambientales?" }
    ],
    5: [
      { author: "Ministerio de Energia", handle: "@min_energia", text: "Equipos de auditoría despachados. Suspensión total preventiva de operaciones en ductos hasta validación de seguridad." }
    ],
    6: [
      { author: "Sec Analyst", handle: "@sec_analyst", text: "Ransomware bloquea controladores de turbinas. Se exigen $20M de rescate. Infraestructura clave fuera de línea." }
    ],
    7: [
      { author: "Supply Chain Net", handle: "@supply_chain", text: "Contratista de monitoreo de vibración reporta compromiso del sistema. Telemetría de mantenimiento completamente caída." }
    ],
    8: [
      { author: "Operations Tech", handle: "@ops_tech", text: "Válvulas de control manual activadas. Intentando recuperación de firmware en PLCs. Se sospecha persistencia de malware." }
    ],
    GLOBAL: {
      1: [
        { author: "Security Intel", handle: "@sec_intel", text: "🚨 RUMOR: Activos corporativos de alto perfil en la mira de campañas cibernéticas coordinadas. Nivel de amenaza incrementado." }
      ],
      2: [
        { author: "Cred Watch", handle: "@credwatch", text: "Credenciales filtradas de administradores de empresas globales detectadas en mercados de la Dark Web. ¡Verifiquen los registros inmediatamente!" }
      ],
      3: [
        { author: "IT Operations", handle: "@itops_global", text: "Picos inusuales de CPU en servidores de bases de datos. Surgen reportes de archivos bloqueados y mensajes de rescate." }
      ],
      4: [
        { author: "Privacy Alert", handle: "@privacyalert", text: "Confirmado: Filtración de base de datos de 100 GB de registros corporativos. Implicaciones críticas para protección de datos/GDPR." }
      ],
      5: [
        { author: "GDPR Inspector", handle: "@gdpr_inspector", text: "Equipos de auditoría despachados para revisar protocolos de cumplimiento tras confirmarse la filtración de datos." }
      ],
      6: [
        { author: "Sec Analyst", handle: "@sec_analyst", text: "Plazo de extorsión fijado en 24h. Ciberactores exigen $20 millones de dólares en BTC. La junta directiva se reúne para decidir la estrategia." }
      ],
      7: [
        { author: "Supply Chain Net", handle: "@supply_chain", text: "Compromiso de proveedor de TI causa efecto cascada. Integraciones de API críticas desactivadas por seguridad." }
      ],
      8: [
        { author: "Systems Admin", handle: "@sysadmin", text: "Inicio de servidor en cuarentena exitoso. Iniciando verificación de firmware. ¡Atención a posibles balizas de red!" }
      ]
    }
  }
};

// Recharts custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13, 19, 41, 0.9)',
        border: '1px solid var(--border-glass)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem'
      }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Tick {payload[0].payload.tick}</p>
        <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, margin: '4px 0 0 0' }}>USD {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function ProjectorDashboard({ sessionData }) {
  const feedContainerRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const companyName = sessionData?.companyName;
  const industryKey = sessionData?.industryKey;
  const industryName = sessionData?.industryName;
  const countries = sessionData?.countries || [];
  const currentStep = sessionData?.currentStep;
  const dimensionScores = sessionData?.dimensionScores || {};
  const gci = sessionData?.gci || 0;
  const dvs = sessionData?.dvs || 0;
  const brs = sessionData?.brs || 0;
  const stockPrice = sessionData?.stockPrice || 0;
  const stockHistory = sessionData?.stockHistory || [];
  const decisionLogs = sessionData?.decisionLogs || [];
  const redTeamLogs = sessionData?.redTeamLogs || [];
  const votes = sessionData?.votes || {};
  const isFinished = sessionData?.isFinished;
  const percentile = sessionData?.percentile;

  useEffect(() => {
    if (sessionData && !sessionData.isFinished && sessionData.currentStep > 0 && sessionData.showQuestion) {
      const activeDecision = CYBERTOP_PREMIUM_CONFIG.decisions.find(d => Number(d.phase) === sessionData.currentStep);
      if (activeDecision && !timerActive) {
        setTimeLeft(activeDecision.sla);
        setTimerActive(true);
      }
    } else {
      setTimerActive(false);
    }
  }, [sessionData?.currentStep, sessionData?.showQuestion]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Compute socialFeed array directly on render (no state required)
  const socialFeed = [];
  if (sessionData && industryKey && currentStep) {
    const indTemplates = SOCIAL_TEMPLATES[industryKey] || {};
    for (let step = 1; step <= currentStep; step++) {
      if (indTemplates[step]) {
        socialFeed.unshift(...indTemplates[step]);
      }
    }
  }

  // Scroll to top of feed on update
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop = 0;
    }
  }, [socialFeed.length]);

  if (!sessionData) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-12 text-center">
        <Activity className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-secondary">Cargando tablero del proyector...</p>
      </div>
    );
  }

  // GCI Gauge configuration
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gci / 100) * circumference;

  // Determine GCI color and status title
  let gciColor = 'var(--status-green)';
  let gciGlow = 'var(--glow-green)';
  let gciTitle = 'BAJO';
  let gciDesc = 'El incidente está bajo monitoreo y contenido preventivamente. La junta vigila.';

  if (gci > 30 && gci <= 55) {
    gciColor = 'var(--status-yellow)';
    gciGlow = 'var(--glow-yellow)';
    gciTitle = 'MODERADO';
    gciDesc = 'Crisis de nivel medio. Fuga potencial de datos y retrasos operativos. Coordinación legal activa.';
  } else if (gci > 55 && gci <= 80) {
    gciColor = 'var(--status-red)';
    gciGlow = 'var(--glow-red)';
    gciTitle = 'CRÍTICO';
    gciDesc = 'Impacto sistémico. Parálisis de negocio en varias regiones. Presión de medios y reguladores.';
  } else if (gci > 80) {
    gciColor = 'var(--status-dark-red)';
    gciGlow = 'var(--glow-dark-red)';
    gciTitle = 'CATASTRÓFICO';
    gciDesc = 'Amenaza de insolvencia operativa y multas regulatorias masivas. Riesgo fiduciario penal.';
  }

  // Stock Chart data parsing
  const chartData = stockHistory.map((price, index) => ({
    tick: index,
    precio: price
  }));

  // 30/60/90 recommendations logic (rendered on debrief)
  const sortedDims = Object.keys(dimensionScores || {})
    .map(key => ({ key, score: dimensionScores[key] }))
    .sort((a, b) => b.score - a.score);

  const getPlanRecommendations = () => {
    const { CYBERTOP_PREMIUM_CONFIG } = require('@/lib/config-premium');
    const recs = { 30: [], 60: [], 90: [] };
    const weakestKeys = sortedDims.slice(0, 2).map(item => item.key);

    weakestKeys.forEach(key => {
      const rec = CYBERTOP_PREMIUM_CONFIG.planRecommendations[key];
      if (rec) {
        recs[30].push({ dimension: key, text: rec[30] });
        recs[60].push({ dimension: key, text: rec[60] });
        recs[90].push({ dimension: key, text: rec[90] });
      }
    });

    if (recs[30].length === 0) {
      const recGG = CYBERTOP_PREMIUM_CONFIG.planRecommendations['GG'];
      recs[30].push({ dimension: 'GG', text: recGG[30] });
      recs[60].push({ dimension: 'PJ', text: CYBERTOP_PREMIUM_CONFIG.planRecommendations['PJ'][60] });
      recs[90].push({ dimension: 'GG', text: recGG[90] });
    }

    return recs;
  };

  const recommendations = isFinished ? getPlanRecommendations() : null;

  // Consensus Poll ratio calculation for active step
  const activeVotes = votes ? votes[currentStep] : null;
  const totalVotes = activeVotes ? (activeVotes.A + activeVotes.B + activeVotes.C) : 0;
  const getVotePercent = (opt) => {
    if (totalVotes === 0) return 0;
    return Math.round((activeVotes[opt] / totalVotes) * 100);
  };

  return (
    <div className="container">
      {/* Printable Watermark */}
      <div className="print-watermark">CONFIDENCIAL CYBERTOP REPORT</div>

      {/* Top Navbar */}
      <div className="top-navbar no-print">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/LogoCyberes.svg" alt="Cyberes Logo" style={{ height: '32px' }} />
          <div className="brand-logo">CYBER<span>TOP</span></div>
          <span className="confidential-tag">SECRET - CLASIFICADO</span>
        </div>
        <div className="simulation-metadata">
          <div className="metadata-item">
            Empresa: <span>{companyName}</span>
          </div>
          <div className="metadata-item">
            Industria: <span>{industryName}</span>
          </div>
          <div className="metadata-item">
            Jurisdicciones: <span>{countries.join(', ')}</span>
          </div>
          <div className="metadata-item">
            Fase: <span>{isFinished ? 'Debríefing' : `${currentStep} / 8`}</span>
          </div>
        </div>
      </div>

      {!isFinished ? (
        currentStep === 0 ? (
          /* ================= PHASE 0 INTRO SCREEN ================= */
          <div className="glass-card" style={{ maxWidth: '1000px', margin: '40px auto', padding: '40px', background: 'rgba(10, 15, 30, 0.6)', border: '1px solid var(--border-glass)' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <img src="/LogoCyberes.svg" alt="Cyberes Logo" style={{ height: '80px', marginBottom: '20px' }} />
              <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
                CYBER<span style={{ color: 'var(--accent-cyan)' }}>TOP</span>
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '8px' }}>
                SIMULADOR ESTRATÉGICO DE CRISIS DE CIBERSEGURIDAD
              </p>
            </div>

            <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
              <div className="metric-mini-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', marginBottom: '12px', fontWeight: 700 }}>
                  Global Crisis Index (GCI)
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Cuantifica en tiempo real la severidad de la crisis en una escala de <strong>0 a 100</strong>. Evaluado a través de inyecciones de amenazas en vivo y las decisiones estratégicas de la Junta.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,230,118,0.1)', color: 'var(--status-green)', border: '1px solid rgba(0,230,118,0.2)' }}>0-30 Bajo</span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,235,59,0.1)', color: 'var(--status-yellow)', border: '1px solid rgba(255,235,59,0.2)' }}>31-55 Moderado</span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,23,68,0.1)', color: 'var(--status-red)', border: '1px solid rgba(255,23,68,0.2)' }}>56-80 Crítico</span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(183,28,28,0.1)', color: 'var(--status-dark-red)', border: '1px solid rgba(183,28,28,0.2)' }}>81+ Catastrófico</span>
                </div>
              </div>

              <div className="metric-mini-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-blue)', marginBottom: '12px', fontWeight: 700 }}>
                  Board Readiness Score (BRS)
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Mide la madurez y preparación de la Junta directiva en una escala de <strong>0.0 a 5.0</strong>. Representa la capacidad de proteger el valor fiduciario y la resiliencia operativa ante incidentes mayores.
                </p>
                <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Empresa a evaluar: <strong style={{ color: '#fff' }}>{companyName}</strong><br />
                  Sector / Ponderación: <strong style={{ color: '#fff' }}>{industryName}</strong>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 700 }}>
                12 Dimensiones Estratégicas de Ciber-Resiliencia
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.85rem' }}>
                {Object.keys(DIMENSION_NAMES).map(key => (
                  <div key={key} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{key}</strong> - {DIMENSION_NAMES[key]}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div className="flex items-center justify-center gap-2" style={{ color: 'var(--accent-cyan)', animation: 'pulse 2s infinite', fontWeight: 600 }}>
                <Activity className="w-5 h-5 animate-spin" /> Esperando a que el Facilitador inicie la simulación...
              </div>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE SIMULATION LAYOUT ================= */
          <div className="dashboard-grid">
            
            {/* Main Panel */}
            <div className="main-board">

              {/* Active Scenario / Inject Card */}
              {currentStep > 0 && (
                <div className="glass-card highlighted" style={{ marginBottom: '20px', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Fase {currentStep} de 8 — Incidente en Curso
                    </span>
                    {sessionData.showQuestion && timeLeft > 0 && (
                      <span style={{ fontSize: '0.85rem', color: timeLeft < 30 ? 'var(--status-red)' : 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock className="w-4 h-4" /> Tiempo Restante: {formatTimer(timeLeft)}
                      </span>
                    )}
                  </div>
                  
                  {(() => {
                    const activeInject = (industryKey && currentStep > 0)
                      ? CYBERTOP_PREMIUM_CONFIG.injects[industryKey]?.[currentStep - 1]
                      : null;
                    const activeDecision = currentStep > 0
                      ? CYBERTOP_PREMIUM_CONFIG.decisions.find(d => Number(d.phase) === currentStep)
                      : null;
                    
                    return (
                      <div style={{ marginTop: '10px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          {activeInject?.title || "Cargando Incidente..."}
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: activeDecision ? '20px' : 0 }}>
                          {activeInject?.desc}
                        </p>

                        {activeDecision && (
                          !sessionData.showQuestion ? (
                            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px dashed var(--border-glass)', textAlign: 'center' }}>
                              <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Clock className="w-5 h-5 text-cyan-400 animate-pulse" /> La Junta está discutiendo el impacto táctico. Esperando revelación de opciones estratégicas...
                              </p>
                            </div>
                          ) : (
                            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px', marginTop: '20px' }}>
                              <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', marginBottom: '16px', fontWeight: 700 }}>
                                {activeDecision.title}
                              </h3>
                              <p style={{ fontSize: '1rem', color: '#fff', marginBottom: '20px', lineHeight: 1.5 }}>
                                {activeDecision.desc}
                              </p>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {activeDecision.options.map(opt => (
                                  <div 
                                    key={opt.key} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '12px', 
                                      padding: '12px 16px', 
                                      background: 'rgba(255, 255, 255, 0.02)', 
                                      border: '1px solid var(--border-glass)', 
                                      borderRadius: '8px',
                                      fontSize: '0.95rem'
                                    }}
                                  >
                                    <div style={{ 
                                      width: '24px', 
                                      height: '24px', 
                                      borderRadius: '50%', 
                                      background: 'var(--accent-cyan)', 
                                      color: 'var(--bg-deep-space)', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      fontWeight: 700, 
                                      fontSize: '0.85rem' 
                                    }}>
                                      {opt.key}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{opt.text}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            
            {/* GCI Hero Section */}
            <div className="glass-card highlighted gci-hero-section">
              <div className="gci-radial-wrapper">
                <svg className="gci-svg">
                  <circle className="gci-track" cx="125" cy="125" r={radius} />
                  <circle 
                    className="gci-value-bar" 
                    cx="125" 
                    cy="125" 
                    r={radius} 
                    stroke={gciColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ filter: `drop-shadow(0 0 8px ${gciColor}33)` }}
                  />
                </svg>
                <div className="gci-center-text">
                  <div className="gci-number" style={{ color: gciColor }}>{gci}</div>
                  <div className="gci-label">GCI INDEX</div>
                </div>
              </div>
              <div className="gci-status-info">
                <div className="gci-status-title" style={{ color: gciColor }}>
                  EXPOSICIÓN: {gciTitle}
                </div>
                <p className="gci-status-desc">{gciDesc}</p>
                
                {/* Secondary scores */}
                <div className="metrics-row" style={{ marginTop: '16px' }}>
                  <div className="metric-mini-card">
                    <div className="metric-mini-label">Board Readiness (BRS)</div>
                    <div className="metric-mini-value" style={{ color: 'var(--accent-cyan)' }}>
                      {brs.toFixed(1)} / 5.0
                    </div>
                  </div>
                  <div className="metric-mini-card">
                    <div className="metric-mini-label">Decision Velocity (DVS)</div>
                    <div className="metric-mini-value" style={{ color: 'var(--accent-blue)' }}>
                      {dvs}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Dimension Grid Heatmap */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Matriz Global de Exposición (12 Dimensiones)
              </h3>
              <div className="heatmap-grid">
                {Object.keys(dimensionScores).map(key => {
                  const score = dimensionScores[key];
                  
                  // Gauge fill color based on score
                  let fill = 'var(--status-green)';
                  if (score > 30 && score <= 55) fill = 'var(--status-yellow)';
                  else if (score > 55 && score <= 80) fill = 'var(--status-red)';
                  else if (score > 80) fill = 'var(--status-dark-red)';

                  return (
                    <div key={key} className="gauge-item">
                      <div className="gauge-header">
                        <span className="gauge-name" title={DIMENSION_NAMES[key]} style={{ whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', lineHeight: '1.2' }}>
                          {key} - {DIMENSION_NAMES[key]}
                        </span>
                        <span className="gauge-val-text">{score}</span>
                      </div>
                      <div className="gauge-bar-track">
                        <div 
                          className="gauge-bar-fill" 
                          style={{ width: `${score}%`, backgroundColor: fill }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Stock Price Chart */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  Media & Market Simulator - Valoración Bursátil
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Precio de Acción
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stockPrice < 100.0 ? 'var(--status-red)' : 'var(--status-green)', fontFamily: 'var(--font-heading)' }}>
                    USD {stockPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="tick" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={11} 
                      tickLine={false} 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="precio" 
                      stroke="var(--accent-cyan)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Sidebar Panel */}
          <div className="sidebar-panel">
            
            {/* Coyuntura Estratégica Card */}
            {redTeamLogs.length > 0 && (
              <div className="glass-card" style={{ border: '1px solid rgba(255, 23, 68, 0.2)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ShieldAlert className="w-5 h-5 text-red-500" /> Coyuntura Estratégica
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                  Incidentes de ciberseguridad inyectados en curso:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {redTeamLogs.map((log, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '10px', 
                        borderRadius: '8px', 
                        background: 'rgba(255, 23, 68, 0.04)', 
                        border: '1px solid rgba(255, 23, 68, 0.15)',
                        fontSize: '0.85rem' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-red)', fontWeight: 700 }}>
                        <span>⚡ {log.name}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Fase {log.step}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {CYBERTOP_PREMIUM_CONFIG.redTeam[log.injectKey]?.desc || "Incidencia de seguridad activa."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Ticker */}
            <div className="glass-card timeline-card" style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe className="w-5 h-5 animate-pulse text-blue-400" /> Monitoreo de Medios & Redes
              </h3>
              <div className="social-feed-container" ref={feedContainerRef} style={{ marginTop: '12px' }}>
                {socialFeed.length > 0 ? (
                  socialFeed.map((tweet, i) => (
                    <div key={i} className="social-card">
                      <div className="social-author">
                        {tweet.author} <span className="social-handle">{tweet.handle}</span>
                      </div>
                      <p className="social-text">{tweet.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col flex-1 items-center justify-center text-center p-8 h-full">
                    <Activity className="w-8 h-8 text-muted mb-2 opacity-55" />
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Esperando activación de crisis para iniciar monitoreo de prensa...
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )) : (
        /* ================= DEBRIEFING EXECUTIVE SCORECARD PRINT ================= */
        <div className="debrief-container">
          
          {/* Printable Watermarked Scorecard Page */}
          <div className="glass-card">
            
            {/* Scorecard Header */}
            <div className="scorecard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/LogoCyberes.svg" alt="Cyberes Logo" style={{ height: '48px' }} />
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
                    CYBER<span style={{ color: 'var(--accent-cyan)' }}>TOP</span>
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px', margin: 0 }}>
                    Digital Decision Board - Executive Crisis Report
                  </p>
                </div>
              </div>
              <div className="scorecard-summary-stats">
                <div className="scorecard-stat-block">
                  <div className="scorecard-stat-label">Global Crisis Index</div>
                  <div className="scorecard-stat-value" style={{ color: gciColor }}>{gci}</div>
                </div>
                <div className="scorecard-stat-block">
                  <div className="scorecard-stat-label">Board Readiness Score</div>
                  <div className="scorecard-stat-value" style={{ color: 'var(--accent-cyan)' }}>{brs.toFixed(1)}/5.0</div>
                </div>
                <div className="scorecard-stat-block">
                  <div className="scorecard-stat-label">Sector Percentile</div>
                  <div className="scorecard-stat-value" style={{ color: 'var(--accent-blue)' }}>
                    {percentile ? `${percentile}%` : '85%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Scorecard Summary Section */}
            <div className="metrics-row" style={{ marginBottom: '32px' }}>
              <div className="metric-mini-card">
                <div className="metric-mini-label">Evaluación de Resiliencia</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '8px', color: gciColor }}>
                  {gci <= 35 ? 'EXCELENTE - Junta Resiliente' : 
                   gci <= 55 ? 'ACEPTABLE - Nivel Operativo' :
                   gci <= 80 ? 'EXPOSICIÓN CRÍTICA - Fallas de Coordinación' :
                   'FALLA DE GOBIERNO FIDUCIARIO'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {gciDesc}
                </p>
              </div>
              <div className="metric-mini-card">
                <div className="metric-mini-label">Perfil de Simulación</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '8px', lineHeight: 1.5 }}>
                  Empresa: <strong>{companyName}</strong><br />
                  Industria: <strong>{industryName}</strong><br />
                  Jurisdicciones Reguladas: <strong>{countries.join(', ')}</strong><br />
                  Decisión Promedio Velocity: <strong>{dvs}%</strong>
                </div>
              </div>
            </div>

            {/* Decision Logs Summary Table */}
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Registro de Decisiones Estratégicas
            </h3>
            <table className="scorecard-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Fase</th>
                  <th>Decisión / Problema a Resolver</th>
                  <th style={{ width: '120px' }}>Opción Elejida</th>
                  <th style={{ width: '140px' }}>SLA / Tiempo</th>
                  <th style={{ width: '100px' }}>DVS Score</th>
                </tr>
              </thead>
              <tbody>
                {decisionLogs.map((log) => {
                  let badge = 'green';
                  if (log.dvs < 60) badge = 'red';
                  else if (log.dvs >= 60 && log.dvs <= 80) badge = 'yellow';

                  return (
                    <tr key={log.decisionId}>
                      <td style={{ fontWeight: 700 }}>Fase {log.decisionId}</td>
                      <td>
                        <strong>{log.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {log.optionText}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        Opción {log.optionChosen}
                      </td>
                      <td>
                        {log.responseTimeSeconds}s <span style={{ color: 'var(--text-muted)' }}>(SLA {log.sla}s)</span>
                      </td>
                      <td>
                        <span className={`scorecard-badge ${badge}`}>
                          {log.dvs}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Red Team Applied Events */}
            {redTeamLogs.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Incidencias Geopolíticas & Red Team (Inyecciones Facilitador)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {redTeamLogs.map((rt, i) => (
                    <div key={i} style={{ background: 'rgba(255,23,68,0.02)', border: '1px solid rgba(255,23,68,0.15)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ color: 'var(--status-red)', fontWeight: 700, fontSize: '0.85rem' }}>
                        ⚠️ {rt.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Inyectado en Fase {rt.step} - Modificó la exposición de la Junta.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 30/60/90 Day Plan Recommendations */}
            {recommendations && (
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Plan Estratégico de Resiliencia Fiduciaria (30/60/90 Días)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                  Basado en las dos dimensiones más débiles y vulnerables evaluadas durante la crisis:
                </p>
                <div className="plan-grid">
                  <div className="plan-column">
                    <h4>Corto Plazo (30 Días)</h4>
                    <ul className="plan-list">
                      {recommendations[30].map((rec, i) => (
                        <li key={i}>
                          <strong>[{rec.dimension}]</strong>: {rec.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="plan-column">
                    <h4>Mediano Plazo (60 Días)</h4>
                    <ul className="plan-list">
                      {recommendations[60].map((rec, i) => (
                        <li key={i}>
                          <strong>[{rec.dimension}]</strong>: {rec.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="plan-column">
                    <h4>Largo Plazo (90 Días)</h4>
                    <ul className="plan-list">
                      {recommendations[90].map((rec, i) => (
                        <li key={i}>
                          <strong>[{rec.dimension}]</strong>: {rec.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }} className="no-print">
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                Reiniciar Simulación
              </button>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Exportar Scorecard (PDF)
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
