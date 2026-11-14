/**
 * CYBERTOP™ Premium 12-Dimension Configuration
 * Supports Global Immersive War Games.
 */

export const CYBERTOP_PREMIUM_CONFIG = {
  // 12 Risk & Readiness Dimensions (0-100)
  dimensions: {
    GG: "Gobierno Global (Global Governance)",
    MC: "Coordinación Multi-jurisdicción (Multi-jurisdictional)",
    VD: "Velocidad de Decisión (Decision Velocity)",
    CC: "Cohesión C-suite (C-suite Cohesion)",
    GI: "Gestión de Inversionistas (Investor Management)",
    ER: "Exposición Regulatoria (Regulatory Exposure)",
    GR: "Gestión Reputacional (Reputational Management)",
    CG: "Continuidad Global (Global Continuity)",
    TI: "Gestión de Terceros Internacionales (International Third-Party)",
    CR: "Cultura de Riesgo (Risk Culture)",
    RF: "Resiliencia Financiera (Financial Resilience)",
    PJ: "Preparación de Junta (Board Preparedness)"
  },

  // Industry weights (sums to 1.0)
  industries: {
    BANCA: {
      name: "Banca Internacional",
      weights: {
        GG: 0.10, MC: 0.10, VD: 0.05, CC: 0.05, GI: 0.10, ER: 0.15,
        GR: 0.10, CG: 0.10, TI: 0.05, CR: 0.05, RF: 0.10, PJ: 0.05
      }
    },
    SALUD: {
      name: "Salud y Farmacéuticas Globales",
      weights: {
        GG: 0.12, MC: 0.08, VD: 0.05, CC: 0.05, GI: 0.05, ER: 0.15,
        GR: 0.10, CG: 0.15, TI: 0.05, CR: 0.05, RF: 0.05, PJ: 0.10
      }
    },
    TECNOLOGIA: {
      name: "Tecnología, Cloud & SaaS Global",
      weights: {
        GG: 0.08, MC: 0.10, VD: 0.08, CC: 0.07, GI: 0.12, ER: 0.10,
        GR: 0.12, CG: 0.10, TI: 0.10, CR: 0.05, RF: 0.05, PJ: 0.03
      }
    },
    OIL_GAS: {
      name: "Oil, Gas & Energía (Infraestructura Crítica)",
      weights: {
        GG: 0.12, MC: 0.10, VD: 0.05, CC: 0.05, GI: 0.05, ER: 0.10,
        GR: 0.08, CG: 0.20, TI: 0.08, CR: 0.05, RF: 0.07, PJ: 0.05
      }
    },
    GLOBAL: {
      name: "Corporativo Global (General)",
      weights: {
        GG: 0.10, MC: 0.08, VD: 0.08, CC: 0.08, GI: 0.08, ER: 0.10,
        GR: 0.10, CG: 0.10, TI: 0.10, CR: 0.08, RF: 0.05, PJ: 0.05
      }
    }
  },

  // Premium Injects (1-8) with 12 dimensions
  injects: {
    BANCA: [
      { id: 1, title: "Fase 1: Alerta Geopolítica", desc: "Un grupo cibercriminal de origen geopolítico hostil declara intenciones de atacar bancos transaccionales.", impacts: { GG: 4, MC: 2, VD: 0, CC: 1, GI: 2, ER: 1, GR: 1, CG: 1, TI: 2, CR: 3, RF: 1, PJ: 3 } },
      { id: 2, title: "Fase 2: Intrusión Silenciosa", desc: "El SOC global reporta el compromiso de credenciales de un administrador regional en LATAM.", impacts: { GG: 2, MC: 4, VD: 1, CC: 1, GI: 1, ER: 2, GR: 2, CG: 3, TI: 3, CR: 2, RF: 1, PJ: 2 } },
      { id: 3, title: "Fase 3: Parálisis de Transferencias", desc: "El sistema SWIFT y las transferencias de alto valor se detienen preventivamente por seguridad en 3 países.", impacts: { GG: 5, MC: 6, VD: 2, CC: 2, GI: 5, ER: 5, GR: 6, CG: 10, TI: 4, CR: 2, RF: 8, PJ: 4 } },
      { id: 4, title: "Fase 4: Exfiltración Confirmada", desc: "Atacantes publican registros de saldos bancarios de clientes VIP en la Dark Web.", impacts: { GG: 3, MC: 5, VD: 2, CC: 3, GI: 8, ER: 8, GR: 10, CG: 4, TI: 2, CR: 3, RF: 6, PJ: 5 } },
      { id: 5, title: "Fase 5: Citación de la SEC / Regulador", desc: "La SEC de EE.UU. y las superintendencias locales exigen notificaciones formales bajo plazos estrictos.", impacts: { GG: 6, MC: 10, VD: 3, CC: 2, GI: 6, ER: 12, GR: 5, CG: 2, TI: 1, CR: 2, RF: 4, PJ: 6 } },
      { id: 6, title: "Fase 6: Demanda de Rescate Multimillonario", desc: "Los extorsionadores exigen USD 20M en cripto y amenazan con borrar los sistemas centrales de core bancario.", impacts: { GG: 8, MC: 6, VD: 4, CC: 4, GI: 10, ER: 6, GR: 8, CG: 6, TI: 2, CR: 4, RF: 12, PJ: 8 } },
      { id: 7, title: "Fase 7: Caída del Custodio Cloud", desc: "El principal custodio digital externo reporta una caída total de infraestructura afectando las firmas de transacciones.", impacts: { GG: 3, MC: 4, VD: 2, CC: 2, GI: 5, ER: 4, GR: 4, CG: 8, TI: 12, CR: 2, RF: 6, PJ: 3 } },
      { id: 8, title: "Fase 8: Retorno Volátil", desc: "Intento de reinicio de transacciones con sospecha de malware latente en el firmware de los terminales.", impacts: { GG: 4, MC: 3, VD: 3, CC: 3, GI: 4, ER: 3, GR: 3, CG: 6, TI: 4, CR: 5, RF: 5, PJ: 6 } }
    ],
    SALUD: [
      { id: 1, title: "Fase 1: Alerta Geopolítica", desc: "Sanciones internacionales aumentan ataques a la cadena de suministro farmacéutica.", impacts: { GG: 5, MC: 3, VD: 0, CC: 1, GI: 1, ER: 2, GR: 1, CG: 3, TI: 4, CR: 3, RF: 1, PJ: 3 } },
      { id: 2, title: "Fase 2: Intrusión Silenciosa", desc: "Se detecta robo de planos y fórmulas de vacunas de patentes críticas globales.", impacts: { GG: 4, MC: 5, VD: 1, CC: 2, GI: 3, ER: 4, GR: 4, CG: 2, TI: 3, CR: 2, RF: 3, PJ: 4 } },
      { id: 3, title: "Fase 3: Parálisis de Hospitales", desc: "Los sistemas de admisión clínica de 4 sedes principales se congelan por ataque ransomware.", impacts: { GG: 4, MC: 4, VD: 2, CC: 3, GI: 2, ER: 6, GR: 6, CG: 12, TI: 4, CR: 2, RF: 6, PJ: 6 } },
      { id: 4, title: "Fase 4: Riesgo de Vida", desc: "Falla de telemetría de monitores UCI obliga a pasar a protocolos manuales de enfermería. Medios llaman.", impacts: { GG: 6, MC: 6, VD: 3, CC: 4, GI: 4, ER: 10, GR: 12, CG: 10, TI: 2, CR: 4, RF: 4, PJ: 8 } },
      { id: 5, title: "Fase 5: Intervención del Ministerio", desc: "Agencias estatales ordenan auditorías in-situ y amenazan con revocación de licencias de operación.", impacts: { GG: 8, MC: 8, VD: 3, CC: 2, GI: 4, ER: 12, GR: 6, CG: 4, TI: 1, CR: 3, RF: 3, PJ: 7 } },
      { id: 6, title: "Fase 6: Ultimátum del Rescate", desc: "Exigencia de USD 20M por el descifrador médico. Amenaza de publicar expedientes confidenciales de pacientes VIP.", impacts: { GG: 7, MC: 6, VD: 4, CC: 3, GI: 6, ER: 8, GR: 10, CG: 6, TI: 2, CR: 4, RF: 10, PJ: 8 } },
      { id: 7, title: "Fase 7: Proveedor Logístico Comprometido", desc: "El distribuidor global de oxígeno y medicamentos reporta infección colateral, deteniendo despachos.", impacts: { GG: 3, MC: 4, VD: 2, CC: 2, GI: 3, ER: 4, GR: 4, CG: 8, TI: 12, CR: 2, RF: 5, PJ: 3 } },
      { id: 8, title: "Fase 8: Reinicio y Cuarentena", desc: "Se intenta reconectar la red hospitalaria con firmware parchado de emergencia pero persiste riesgo de reinfección.", impacts: { GG: 4, MC: 3, VD: 3, CC: 3, GI: 2, ER: 4, GR: 3, CG: 8, TI: 4, CR: 5, RF: 4, PJ: 6 } }
    ],
    TECNOLOGIA: [
      { id: 1, title: "Fase 1: Alerta Geopolítica", desc: "Conflicto diplomático provoca una ola de denegaciones de servicio (DDoS) contra infraestructuras DNS globales.", impacts: { GG: 3, MC: 2, VD: 1, CC: 1, GI: 3, ER: 1, GR: 2, CG: 4, TI: 3, CR: 2, RF: 2, PJ: 2 } },
      { id: 2, title: "Fase 2: Intrusión Silenciosa", desc: "Confirmada la infiltración a repositorios máster de código fuente y credenciales de AWS expuestas.", impacts: { GG: 3, MC: 4, VD: 2, CC: 2, GI: 4, ER: 3, GR: 4, CG: 4, TI: 5, CR: 3, RF: 4, PJ: 3 } },
      { id: 3, title: "Fase 3: Parálisis de Plataformas", desc: "Las APIs centrales y consolas del cliente fallan a nivel global. SLAs superados ampliamente.", impacts: { GG: 4, MC: 5, VD: 3, CC: 3, GI: 8, ER: 4, GR: 8, CG: 11, TI: 6, CR: 2, RF: 10, PJ: 4 } },
      { id: 4, title: "Fase 4: Amenazas Enterprise", desc: "Clientes Fortune 500 exigen indemnizaciones multimillonarias y amenazan con migración inmediata de proveedor.", impacts: { GG: 6, MC: 6, VD: 2, CC: 4, GI: 10, ER: 6, GR: 10, CG: 5, TI: 4, CR: 3, RF: 8, PJ: 5 } },
      { id: 5, title: "Fase 5: Multas GDPR y CCPA", desc: "Las agencias de protección de datos de la UE y California inician procesos sancionatorios.", impacts: { GG: 5, MC: 10, VD: 2, CC: 2, GI: 8, ER: 12, GR: 6, CG: 2, TI: 2, CR: 2, RF: 6, PJ: 4 } },
      { id: 6, title: "Fase 6: Demanda de Rescate", desc: "Exigencia de USD 20M por no publicar el código fuente y bases completas de bases de datos de clientes.", impacts: { GG: 7, MC: 5, VD: 4, CC: 4, GI: 11, ER: 4, GR: 8, CG: 4, TI: 2, CR: 4, RF: 9, PJ: 6 } },
      { id: 7, title: "Fase 7: Proveedor Cloud Caído", desc: "El host de Kubernetes reporta una brecha de infraestructura que afecta el plano de control central.", impacts: { GG: 3, MC: 4, VD: 2, CC: 2, GI: 6, ER: 3, GR: 4, CG: 6, TI: 12, CR: 2, RF: 6, PJ: 2 } },
      { id: 8, title: "Fase 8: Reinicio API", desc: "Se levantan servicios pero los tokens de sesión no invalidados permiten reinfección de microservicios.", impacts: { GG: 4, MC: 3, VD: 3, CC: 3, GI: 4, ER: 3, GR: 3, CG: 5, TI: 5, CR: 4, RF: 4, PJ: 4 } }
    ],
    OIL_GAS: [
      { id: 1, title: "Fase 1: Alerta Geopolítica", desc: "Ciber-ejército extranjero intensifica escaneos de vulnerabilidades SCADA en refinerías.", impacts: { GG: 4, MC: 3, VD: 0, CC: 1, GI: 1, ER: 1, GR: 1, CG: 4, TI: 3, CR: 3, RF: 2, PJ: 3 } },
      { id: 2, title: "Fase 2: Intrusión Silenciosa", desc: "Se detectan credenciales de VPN de soporte técnico comprometidas y conexiones desde IPs inusuales.", impacts: { GG: 2, MC: 3, VD: 1, CC: 1, GI: 1, ER: 2, GR: 2, CG: 4, TI: 4, CR: 2, RF: 2, PJ: 3 } },
      { id: 3, title: "Fase 3: Parálisis SCADA", desc: "Los operadores pierden la visibilidad y telemetría de las válvulas de presión del gasoducto principal.", impacts: { GG: 5, MC: 5, VD: 2, CC: 2, GI: 3, ER: 5, GR: 4, CG: 12, TI: 4, CR: 2, RF: 8, PJ: 4 } },
      { id: 4, title: "Fase 4: Alarma Ambiental", desc: "Presión excesiva en sensores del ducto obliga a parar el flujo físico. Filtración rumoreada en redes.", impacts: { GG: 6, MC: 6, VD: 3, CC: 3, GI: 5, ER: 8, GR: 10, CG: 10, TI: 2, CR: 4, RF: 5, PJ: 6 } },
      { id: 5, title: "Fase 5: Intervención de Energía", desc: "El Ministerio de Energía ordena cese total preventivo de ductos y abre investigación formal.", impacts: { GG: 8, MC: 8, VD: 3, CC: 2, GI: 4, ER: 12, GR: 5, CG: 6, TI: 1, CR: 3, RF: 4, PJ: 5 } },
      { id: 6, title: "Fase 6: Demanda de Rescate", desc: "Los cibercriminales exigen USD 20M para descifrar el software de control de bombas e ingeniería de ductos.", impacts: { GG: 7, MC: 6, VD: 4, CC: 3, GI: 6, ER: 6, GR: 7, CG: 8, TI: 2, CR: 4, RF: 10, PJ: 7 } },
      { id: 7, title: "Fase 7: Contratista Crítico Afectado", desc: "El proveedor que monitorea vibración y mantenimiento predictivo sufre compromiso total.", impacts: { GG: 3, MC: 4, VD: 2, CC: 2, GI: 3, ER: 3, GR: 3, CG: 8, TI: 12, CR: 2, RF: 5, PJ: 2 } },
      { id: 8, title: "Fase 8: Reinicio Planta", desc: "Se intenta energizar controladores de ductos pero se detecta malware inyectado en la memoria flash de PLCs.", impacts: { GG: 4, MC: 3, VD: 3, CC: 3, GI: 3, ER: 4, GR: 3, CG: 8, TI: 4, CR: 5, RF: 4, PJ: 5 } }
    ],
    GLOBAL: [
      { id: 1, title: "Fase 1: Alerta Geopolítica", desc: "Un grupo cibercriminal de primer nivel publica una lista de objetivos corporativos internacionales, incluyendo a nuestra compañía.", impacts: { GG: 4, MC: 3, VD: 0, CC: 1, GI: 2, ER: 2, GR: 1, CG: 3, TI: 3, CR: 3, RF: 1, PJ: 3 } },
      { id: 2, title: "Fase 2: Intrusión Silenciosa", desc: "El equipo de seguridad de TI detecta que credenciales de administradores clave han sido publicadas en un foro de la Dark Web.", impacts: { GG: 3, MC: 4, VD: 1, CC: 2, GI: 3, ER: 3, GR: 3, CG: 3, TI: 4, CR: 2, RF: 2, PJ: 4 } },
      { id: 3, title: "Fase 3: Parálisis de Sistemas", desc: "Múltiples servidores de correo y sistemas internos clave comienzan a cifrarse. Se despliega un mensaje de rescate.", impacts: { GG: 4, MC: 4, VD: 2, CC: 3, GI: 4, ER: 5, GR: 6, CG: 11, TI: 4, CR: 2, RF: 7, PJ: 5 } },
      { id: 4, title: "Fase 4: Exfiltración Confirmada", desc: "Se confirma la exfiltración de 100 GB de datos sensibles, incluyendo información financiera y datos confidenciales del board.", impacts: { GG: 5, MC: 5, VD: 2, CC: 3, GI: 7, ER: 7, GR: 10, CG: 5, TI: 3, CR: 3, RF: 5, PJ: 6 } },
      { id: 5, title: "Fase 5: Exposición Regulatoria", desc: "Autoridades de protección de datos notifican la apertura de investigaciones inmediatas por el incidente de seguridad.", impacts: { GG: 6, MC: 8, VD: 3, CC: 2, GI: 5, ER: 12, GR: 5, CG: 3, TI: 2, CR: 3, RF: 3, PJ: 6 } },
      { id: 6, title: "Fase 6: Demanda de Rescate", desc: "Los atacantes envían un ultimátum exigiendo USD 20M para no divulgar públicamente la base de datos completa.", impacts: { GG: 7, MC: 6, VD: 4, CC: 4, GI: 8, ER: 6, GR: 8, CG: 6, TI: 2, CR: 4, RF: 10, PJ: 7 } },
      { id: 7, title: "Fase 7: Compromiso de Terceros", desc: "Un proveedor clave de servicios TI reporta un compromiso colateral que suspende operaciones críticas de nuestro negocio.", impacts: { GG: 3, MC: 4, VD: 2, CC: 2, GI: 4, ER: 3, GR: 4, CG: 7, TI: 12, CR: 2, RF: 5, PJ: 3 } },
      { id: 8, title: "Fase 8: Recuperación y Retorno", desc: "Se inicia la reconexión de sistemas en cuarentena, pero persisten alertas de tráfico anómalo en la red.", impacts: { GG: 4, MC: 3, VD: 3, CC: 3, GI: 3, ER: 3, GR: 3, CG: 8, TI: 4, CR: 5, RF: 4, PJ: 5 } }
    ]
  },

  // 6 Decisions Points mapped to 12 dimensions
  decisions: [
    {
      id: 1,
      phase: 1,
      title: "DECISIÓN 1 – Activación de Crisis y Gobierno",
      desc: "El SOC informa anomalías. ¿Cómo estructuramos el comando?",
      sla: 120,
      options: [
        {
          key: "A",
          text: "Activar de inmediato comité de crisis y designar un Incident Commander técnico.",
          impacts: { GG: -4, MC: -2, VD: -6, CC: -4, GI: 0, ER: -2, GR: -2, CG: 0, TI: 0, CR: -4, RF: 0, PJ: -6 },
          mitigations: ["comite_activo", "liderazgo_claro"]
        },
        {
          key: "B",
          text: "Iniciar investigaciones técnicas sin activar comité para evitar pánico interno.",
          impacts: { GG: 2, MC: 1, VD: -2, CC: 0, GI: 1, ER: 2, GR: 2, CG: 0, TI: 0, CR: 0, RF: 0, PJ: -2 }
        },
        {
          key: "C",
          text: "Descartar como falso positivo y esperar reporte consolidado en 24 horas.",
          impacts: { GG: 6, MC: 4, VD: 6, CC: 4, GI: 4, ER: 4, GR: 4, CG: 2, TI: 0, CR: 4, RF: 2, PJ: 6 },
          penalties: ["no_activacion_critica"]
        }
      ]
    },
    {
      id: 2,
      phase: 2,
      title: "DECISIÓN 2 – Contención vs. Continuidad Operativa",
      desc: "Se confirma el ransomware. ¿Se aíslan las redes globalmente?",
      sla: 180,
      options: [
        {
          key: "A",
          text: "Desconexión total inmediata de enlaces de red (Contención agresiva).",
          impacts: { GG: 4, MC: 4, VD: -6, CC: -2, GI: 2, ER: 0, GR: -2, CG: 6, TI: 0, CR: -4, RF: 4, PJ: -4 },
          mitigations: ["contencion_agresiva"]
        },
        {
          key: "B",
          text: "Mantener sistemas encendidos para evitar caídas en el servicio (Continuidad sin control).",
          impacts: { GG: -4, MC: -2, VD: 6, CC: 4, GI: 4, ER: 6, GR: 6, CG: -2, TI: 0, CR: 4, RF: -2, PJ: 6 },
          penalties: ["sin_contencion"]
        },
        {
          key: "C",
          text: "Aislamiento segmentado de servidores críticos tras inventario rápido (Híbrido).",
          impacts: { GG: 1, MC: 1, VD: -4, CC: -1, GI: 1, ER: 0, GR: -1, CG: 2, TI: 0, CR: -2, RF: 1, PJ: -2 },
          mitigations: ["contencion_hibrida"]
        }
      ]
    },
    {
      id: 3,
      phase: 3,
      title: "DECISIÓN 3 – Comunicación Inicial y Prensa",
      desc: "Periodista llama por datos filtrados. ¿Qué declaramos públicamente?",
      sla: 120,
      options: [
        {
          key: "A",
          text: "Emitir holding statement breve y transparente, controlando voceros oficiales.",
          impacts: { GG: -2, MC: -1, VD: 0, CC: -4, GI: -2, ER: -2, GR: -8, CG: 0, TI: 0, CR: -2, RF: 0, PJ: -4 },
          mitigations: ["comms_adecuado"]
        },
        {
          key: "B",
          text: "Mantener silencio absoluto e ignorar las consultas de prensa.",
          impacts: { GG: 4, MC: 2, VD: 0, CC: 2, GI: 6, ER: 2, GR: 10, CG: 0, TI: 0, CR: 2, RF: 2, PJ: 4 }
        },
        {
          key: "C",
          text: "Publicar un comunicado apresurado desmintiendo cualquier brecha relevante.",
          impacts: { GG: 6, MC: 4, VD: 0, CC: 4, GI: 4, ER: 4, GR: 6, CG: 0, TI: 0, CR: 4, RF: 1, PJ: 6 },
          penalties: ["comunicado_prematuro"]
        }
      ]
    },
    {
      id: 4,
      phase: 4,
      title: "DECISIÓN 4 – Notificación Regulatoria y Seguros",
      desc: "Plazo legal del regulador corriendo. ¿En qué momento notificamos?",
      sla: 180,
      options: [
        {
          key: "A",
          text: "Notificar formalmente con datos iniciales dentro del plazo (Cumplimiento).",
          impacts: { GG: -2, MC: -8, VD: 0, CC: -2, GI: -2, ER: -10, GR: -2, CG: 0, TI: 0, CR: -2, RF: 0, PJ: -4 },
          mitigations: ["notificacion_tiempo"]
        },
        {
          key: "B",
          text: "Notificar tarde argumentando que se esperaban detalles forenses definitivos.",
          impacts: { GG: 2, MC: 4, VD: 0, CC: 1, GI: 2, ER: 4, GR: 2, CG: 0, TI: 0, CR: 0, RF: 1, PJ: 0 }
        },
        {
          key: "C",
          text: "Ocultar el incidente al regulador y omitir el aviso formal.",
          impacts: { GG: 6, MC: 10, VD: 0, CC: 4, GI: 6, ER: 15, GR: 6, CG: 0, TI: 0, CR: 4, RF: 3, PJ: 6 },
          penalties: ["no_notificacion_regulador"]
        }
      ]
    },
    {
      id: 5,
      phase: 5,
      title: "DECISIÓN 5 – Postura Frente al Rescate de Datos",
      desc: "Se exige el pago de USD 20M por la llave. ¿Qué hacemos?",
      sla: 180,
      options: [
        {
          key: "A",
          text: "Negar tajantemente cualquier pago y enfocar esfuerzos en recuperación de respaldos.",
          impacts: { GG: -4, MC: -2, VD: -2, CC: -2, GI: -2, ER: -2, GR: -4, CG: 4, TI: 0, CR: -4, RF: 6, PJ: -4 }
        },
        {
          key: "B",
          text: "Negociar activamente el monto para ganar tiempo operativo y analizar la llave.",
          impacts: { GG: -2, MC: 0, VD: -2, CC: -1, GI: 0, ER: 0, GR: -2, CG: 2, TI: 0, CR: -2, RF: 4, PJ: -2 }
        },
        {
          key: "C",
          text: "Proceder al pago inmediato del rescate para agilizar la entrega de la llave.",
          impacts: { GG: 4, MC: 4, VD: -4, CC: 2, GI: 4, ER: 6, GR: 6, CG: -4, TI: 0, CR: 4, RF: 2, PJ: 4 },
          penalties: ["pago_rescate"]
        }
      ]
    },
    {
      id: 6,
      phase: 6,
      title: "DECISIÓN 6 – Retorno a Operaciones",
      desc: "Sistemas recuperables. ¿Cómo reactivamos los accesos?",
      sla: 120,
      options: [
        {
          key: "A",
          text: "Verificación y sanitización exhaustiva de endpoints antes de reconectar a red.",
          impacts: { GG: -4, MC: -2, VD: -6, CC: -2, GI: 0, ER: 0, GR: 0, CG: -2, TI: 0, CR: -4, RF: -2, PJ: -6 },
          mitigations: ["verificacion_completa"]
        },
        {
          key: "B",
          text: "Forzar un reinicio acelerado de los sistemas para cortar pérdidas de negocio hoy.",
          impacts: { GG: 4, MC: 2, VD: 6, CC: 2, GI: 2, ER: 2, GR: 2, CG: -4, TI: 0, CR: 4, RF: -4, PJ: 6 },
          penalties: ["retorno_sin_verificar"]
        },
        {
          key: "C",
          text: "Esperar a concluir el informe forense completo antes de levantar el primer servidor.",
          impacts: { GG: 2, MC: 1, VD: -2, CC: 0, GI: 1, ER: 0, GR: 0, CG: 6, TI: 0, CR: -2, RF: 4, PJ: -2 }
        }
      ]
    }
  ],

  // Red Team facilitator injections (unannounced modifiers)
  redTeam: {
    insider_leak: { name: "Filtración por Insider", desc: "Un empleado filtró chats internos de la crisis a la prensa.", impacts: { GR: 12, GG: 6, CC: 4 } },
    backup_corrupted: { name: "Copias de Respaldo Corruptas", desc: "El ransomware afectó la partición secundaria del NAS de respaldos.", impacts: { CG: 15, RF: 10, PJ: 5 } },
    class_action: { name: "Amenaza de Demanda Colectiva", desc: "Bufetes de abogados anuncian demandas fiduciarias en EE.UU. e Italia.", impacts: { ER: 15, GI: 8, GG: 5 } },
    insurance_denied: { name: "Póliza de Seguros Denegada", desc: "El broker de seguros deniega la cobertura por falta de aviso inmediato.", impacts: { RF: 15, PJ: 8, GG: 4 } },
    phishing_campaign: { name: "Campaña de Phishing Activa", desc: "Se detectan correos dirigidos suplantando al CEO pidiendo autorizaciones bancarias.", impacts: { PJ: 10, VD: 4, CC: 2 } },
    regulatory_raid: { name: "Auditoría de Cumplimiento In-Situ", desc: "Auditores del regulador de datos llegan sin aviso a las oficinas centrales.", impacts: { ER: 15, MC: 10, GG: 5 } }
  },

  penalties: {
    no_activacion_critica: { val: 8, label: "Falta de activación del comité de crisis en fase inicial" },
    sin_contencion: { val: 6, label: "No contención y propagación libre del ataque" },
    comunicado_prematuro: { val: 6, label: "Comunicado prematuro que desinforma y expone legalmente" },
    no_notificacion_regulador: { val: 10, label: "Incumplimiento grave de notificación obligatoria al regulador" },
    pago_rescate: { val: 6, label: "Riesgo legal y fiduciario por pago directo de extorsión" },
    retorno_sin_verificar: { val: 4, label: "Retorno a producción acelerado sin auditoría de firmware/firmas" }
  },

  mitigations: {
    comite_activo: { val: 4, label: "Liderazgo y comités formalizados" },
    liderazgo_claro: { val: 2, label: "Incident Commander asignado" },
    contencion_agresiva: { val: 4, label: "Aislamiento agresivo de redes" },
    contencion_hibrida: { val: 3, label: "Aislamiento ordenado y selectivo" },
    comms_adecuado: { val: 4, label: "Relaciones públicas y Legal en control de vocería" },
    notificacion_tiempo: { val: 8, label: "Notificación regulatoria oportuna" },
    verificacion_completa: { val: 6, label: "Certificación forense de firmware y hosts" }
  },

  // Plan 30/60/90 recommendations
  planRecommendations: {
    GG: {
      30: "Formalizar la matriz de gobierno de crisis global y roles de delegación.",
      60: "Realizar simulacros de gobernanza con la Junta directiva internacional.",
      90: "Homologar las respuestas de crisis fiduciaria de todas las holdings de la corporación."
    },
    MC: {
      30: "Definir un protocolo de coordinación legal entre filiales geográficas.",
      60: "Realizar ejercicios específicos de respuesta multijurisdiccional (SEC/GDPR/Superintendencias).",
      90: "Establecer contratos de contingencia legal internacional con firmas de ciberseguridad."
    },
    VD: {
      30: "Definir y validar los SLAs máximos de decisión para comités de crisis.",
      60: "Implementar herramientas de comunicación de crisis encriptadas secundarias.",
      90: "Auditar periódicamente la velocidad del flujo de comunicación ante incidentes mayores."
    },
    CC: {
      30: "Establecer lineamientos claros de resolución de disidencias en la Alta Gerencia.",
      60: "Realizar talleres presenciales de liderazgo C-suite bajo situaciones de crisis extrema.",
      90: "Revisar los planes de sucesión de emergencia para puestos clave de la C-Suite."
    },
    GI: {
      30: "Redactar la estrategia de comunicación para inversionistas institucionales.",
      60: "Establecer un 'holding statement' regulado para disclosure bursátil.",
      90: "Simular llamados telefónicos de emergencia y calls con inversionistas mayoritarios."
    },
    ER: {
      30: "Elaborar un checklist regulatorio consolidado por países.",
      60: "Entrenar al equipo legal en los tiempos de notificación y divulgación pública.",
      90: "Auditar los términos contractuales de responsabilidad civil y cibernética."
    },
    GR: {
      30: "Definir la política de relaciones públicas de crisis y control de voceros oficiales.",
      60: "Monitorear e indexar menciones en la dark web y foros de cibercriminales.",
      90: "Ejecutar pruebas con agencias de relaciones públicas de crisis globales."
    },
    CG: {
      30: "Revisar y validar el Plan de Continuidad de Negocio (BCP) global.",
      60: "Pruebas de conmutación de centros de datos georredundantes en caliente.",
      90: "Diversificar proveedores de infraestructura cloud a holdings secundarias."
    },
    TI: {
      30: "Identificar y catalogar los proveedores externos críticos internacionales.",
      60: "Auditar SLAs y medidas de seguridad de accesos VPN a proveedores externos.",
      90: "Implementar evaluaciones de riesgo continuas a partners de la cadena de suministro."
    },
    CR: {
      30: "Iniciar un programa continuo de concientización de ingeniería social al C-suite.",
      60: "Simular ataques dirigidos (phishing ejecutivo y vishing) para reportar fallas.",
      90: "Integrar la madurez decisional en ciberseguridad en el bono anual de gerentes."
    },
    RF: {
      30: "Evaluar límites de cobertura y exclusiones de la póliza de ciberseguros corporativa.",
      60: "Cuantificar el costo financiero de inactividad de las 'joyas de la corona'.",
      90: "Constituir un fondo de reserva para contingencias financieras por secuestro de datos."
    },
    PJ: {
      30: "Establecer roles fiduciarios claros del presidente de la Junta ante incidentes.",
      60: "Integrar reportes consolidados de ciberseguridad y riesgo en cada sesión ordinaria.",
      90: "Certificar la gobernanza fiduciaria digital del Board según estándares internacionales."
    }
  }
};
