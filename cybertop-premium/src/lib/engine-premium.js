import { CYBERTOP_PREMIUM_CONFIG } from './config-premium.js';

export class CybertopPremiumEngine {
  constructor(companyName = 'Global Corp', industryKey = 'BANCA', countries = ['LATAM']) {
    if (!CYBERTOP_PREMIUM_CONFIG.industries[industryKey]) {
      throw new Error(`Invalid industry key: ${industryKey}`);
    }
    
    this.companyName = companyName;
    this.industryKey = industryKey;
    this.countries = countries;
    this.industryConfig = CYBERTOP_PREMIUM_CONFIG.industries[industryKey];
    this.weights = this.industryConfig.weights;
    this.injects = CYBERTOP_PREMIUM_CONFIG.injects[industryKey];
    this.decisions = CYBERTOP_PREMIUM_CONFIG.decisions;
    
    this.reset();
  }

  /**
   * Resets the simulation state to step 0
   */
  reset() {
    this.currentStep = 0; // 0 = setup, 1-8 = active inject phases
    
    // 12 Risk & Readiness Dimensions initialized to 0
    this.dimensionScores = {
      GG: 0, MC: 0, VD: 0, CC: 0, GI: 0, ER: 0,
      GR: 0, CG: 0, TI: 0, CR: 0, RF: 0, PJ: 0
    };
    
    this.gci = 0; // Global Crisis Index (0 - 100)
    
    // Penalties and mitigations tracking
    this.activePenalties = new Set();
    this.activeMitigations = new Set();
    
    // Decision logs: { decisionId, title, optionChosen, optionText, responseTimeSeconds, sla, dvs }
    this.decisionLogs = [];
    this.redTeamLogs = [];
    
    // Vote counts for consensus poll at each step: { stepNum: { A: 0, B: 0, C: 0 } }
    this.votes = {};
    for (let step = 1; step <= 8; step++) {
      this.votes[step] = { A: 0, B: 0, C: 0 };
    }
    
    // Summary metrics
    this.dvs = 100; // Decision Velocity Score average (0 - 100)
    this.brs = 5.0; // Board Readiness Score (0.0 - 5.0)
    
    // Stock price tracking
    this.stockPrice = 100.0;
    this.stockHistory = [100.0, 100.0, 100.0, 100.0, 100.0]; // Tick history
    
    this.history = []; // History array to support undo
  }

  /**
   * Returns current simulation state as a plain object
   */
  getState() {
    return {
      companyName: this.companyName,
      industryKey: this.industryKey,
      industryName: this.industryConfig.name,
      countries: this.countries,
      currentStep: this.currentStep,
      dimensionScores: { ...this.dimensionScores },
      gci: Math.round(this.gci),
      dvs: Math.round(this.dvs),
      brs: parseFloat(this.brs.toFixed(1)),
      stockPrice: parseFloat(this.stockPrice.toFixed(2)),
      stockHistory: [...this.stockHistory],
      activePenalties: Array.from(this.activePenalties).map(k => ({
        key: k,
        ...CYBERTOP_PREMIUM_CONFIG.penalties[k]
      })),
      activeMitigations: Array.from(this.activeMitigations).map(k => ({
        key: k,
        ...CYBERTOP_PREMIUM_CONFIG.mitigations[k]
      })),
      decisionLogs: [...this.decisionLogs],
      redTeamLogs: [...this.redTeamLogs],
      votes: { ...this.votes },
      isFinished: this.currentStep >= 9
    };
  }

  /**
   * Re-instantiates an engine with a previous saved state
   */
  static fromState(state) {
    const engine = new CybertopPremiumEngine(state.companyName, state.industryKey, state.countries);
    engine.currentStep = state.currentStep;
    engine.dimensionScores = { ...state.dimensionScores };
    engine.gci = state.gci;
    engine.dvs = state.dvs;
    engine.brs = state.brs;
    engine.stockPrice = state.stockPrice;
    engine.stockHistory = [...state.stockHistory];
    engine.activePenalties = new Set((state.activePenalties || []).map(p => p.key));
    engine.activeMitigations = new Set((state.activeMitigations || []).map(m => m.key));
    engine.decisionLogs = [...(state.decisionLogs || [])];
    engine.redTeamLogs = [...(state.redTeamLogs || [])];
    engine.votes = { ...state.votes };
    return engine;
  }

  /**
   * Returns dimension multipliers based on active countries
   */
  getCountryMultipliers() {
    const multipliers = {};
    const dims = ['GG', 'MC', 'VD', 'CC', 'GI', 'ER', 'GR', 'CG', 'TI', 'CR', 'RF', 'PJ'];
    dims.forEach(d => multipliers[d] = 1.0);

    // EU regulations amplify regulatory exposure and multi-jurisdictional coordination risks
    if (this.countries.includes('EU')) {
      multipliers['ER'] *= 1.25;
      multipliers['MC'] *= 1.25;
    }
    // US regulations amplify regulatory exposure and investor relation risks
    if (this.countries.includes('US')) {
      multipliers['ER'] *= 1.20;
      multipliers['GI'] *= 1.20;
    }
    // LATAM is base (1.0x)
    return multipliers;
  }

  /**
   * Submits a vote for a specific option in the current step
   */
  submitVote(step, option) {
    const uppercaseOpt = option.toUpperCase();
    if (this.votes[step] && ['A', 'B', 'C'].includes(uppercaseOpt)) {
      this.votes[step][uppercaseOpt]++;
    }
    return this.getState();
  }

  /**
   * Advances the simulation by introducing the next inject and optionally recording a decision option.
   */
  advanceStep(optionChosen = null, responseTimeSeconds = 0) {
    if (this.currentStep >= 9) {
      console.warn("Simulation is already finished.");
      return this.getState();
    }

    // Save previous state to history for undo capabilities
    this.history.push({
      currentStep: this.currentStep,
      dimensionScores: { ...this.dimensionScores },
      gci: this.gci,
      activePenalties: new Set(this.activePenalties),
      activeMitigations: new Set(this.activeMitigations),
      decisionLogs: [...this.decisionLogs],
      redTeamLogs: [...this.redTeamLogs],
      votes: JSON.parse(JSON.stringify(this.votes)),
      dvs: this.dvs,
      brs: this.brs,
      stockPrice: this.stockPrice,
      stockHistory: [...this.stockHistory]
    });

    let decisionImpacts = {};
    let velocityImpacts = {};
    let uncertaintyImpacts = {};

    // 1. Process decision impacts for the CURRENT step before advancing
    if (this.currentStep > 0 && this.currentStep <= 8) {
      // Find decision associated with the current step
      const decision = this.decisions.find(d => d.phase === this.currentStep);
      
      if (decision && optionChosen) {
        const option = decision.options.find(o => o.key === optionChosen.toUpperCase());
        if (option) {
          decisionImpacts = option.impacts || {};

          // Apply penalties and mitigations
          if (option.penalties) {
            option.penalties.forEach(p => this.activePenalties.add(p));
          }
          if (option.mitigations) {
            option.mitigations.forEach(m => this.activeMitigations.add(m));
          }

          // DVS = max(0, min(100, 100 * (1 - (time - SLA) / (2 * SLA))))
          const sla = decision.sla;
          const dvs_j = Math.max(0, Math.min(100, Math.round(
            100 * (1 - (responseTimeSeconds - sla) / (2 * sla))
          )));

          // SLA threshold adjustments (velocity impacts)
          if (dvs_j < 60) {
            velocityImpacts.ER = 2; // regulator notices slow response
            velocityImpacts.MC = 1;
          } else if (dvs_j > 80) {
            velocityImpacts.ER = -1;
            velocityImpacts.MC = -1;
          }

          // Uncertainty drift for exceeding SLA
          if (responseTimeSeconds > sla) {
            uncertaintyImpacts.GR = 2; // PR worsens
            uncertaintyImpacts.VD = 2; // decision velocity degrades
          }

          // Log decision choice
          this.decisionLogs.push({
            decisionId: decision.id,
            title: decision.title,
            optionChosen: optionChosen.toUpperCase(),
            optionText: option.text,
            responseTimeSeconds,
            sla,
            dvs: dvs_j
          });

          // Recalculate DVS average
          const totalDvs = this.decisionLogs.reduce((sum, log) => sum + log.dvs, 0);
          this.dvs = totalDvs / this.decisionLogs.length;
        }
      }
    }

    // Apply country multipliers to positive dimension increases
    const countryMults = this.getCountryMultipliers();

    // Update 12 dimensions from the decision (if any)
    for (const key of Object.keys(this.dimensionScores)) {
      const prev = this.dimensionScores[key];
      const increment = (decisionImpacts[key] || 0) + 
                        (velocityImpacts[key] || 0) + 
                        (uncertaintyImpacts[key] || 0);

      // Multiplier applies to risk increases
      const appliedIncrement = increment > 0 ? increment * (countryMults[key] || 1.0) : increment;
      
      this.dimensionScores[key] = Math.max(0, Math.min(100, Math.round(prev + appliedIncrement)));
    }

    // 2. Advance the step
    this.currentStep++;
    const nextStep = this.currentStep;

    // 3. Apply the base impacts of the NEW step's inject
    if (nextStep <= 8) {
      const inject = this.injects[nextStep - 1];
      const baseImpacts = inject ? inject.impacts : {};

      for (const key of Object.keys(this.dimensionScores)) {
        const prev = this.dimensionScores[key];
        const increment = baseImpacts[key] || 0;
        const appliedIncrement = increment > 0 ? increment * (countryMults[key] || 1.0) : increment;
        
        this.dimensionScores[key] = Math.max(0, Math.min(100, Math.round(prev + appliedIncrement)));
      }
    }

    // Recompute indices
    this.recalculateIndices();

    return this.getState();
  }

  /**
   * Facilitator injects a Red Team threat event
   */
  injectRedTeam(injectKey) {
    const inject = CYBERTOP_PREMIUM_CONFIG.redTeam[injectKey];
    if (!inject) {
      console.warn(`Invalid Red Team inject key: ${injectKey}`);
      return this.getState();
    }

    // Check if already applied to prevent duplicates
    if (this.redTeamLogs.some(log => log.injectKey === injectKey)) {
      console.warn(`Red Team inject "${injectKey}" already applied.`);
      return this.getState();
    }

    // Save previous state to history
    this.history.push({
      currentStep: this.currentStep,
      dimensionScores: { ...this.dimensionScores },
      gci: this.gci,
      activePenalties: new Set(this.activePenalties),
      activeMitigations: new Set(this.activeMitigations),
      decisionLogs: [...this.decisionLogs],
      redTeamLogs: [...this.redTeamLogs],
      votes: JSON.parse(JSON.stringify(this.votes)),
      dvs: this.dvs,
      brs: this.brs,
      stockPrice: this.stockPrice,
      stockHistory: [...this.stockHistory]
    });

    // Apply Red Team impacts directly to dimensions
    const impacts = inject.impacts || {};
    const countryMults = this.getCountryMultipliers();

    for (const key of Object.keys(this.dimensionScores)) {
      const prev = this.dimensionScores[key];
      const increment = impacts[key] || 0;
      const appliedIncrement = increment > 0 ? increment * (countryMults[key] || 1.0) : increment;
      this.dimensionScores[key] = Math.max(0, Math.min(100, Math.round(prev + appliedIncrement)));
    }

    // Log the inject
    this.redTeamLogs.push({
      injectKey,
      name: inject.name,
      description: inject.desc,
      step: this.currentStep,
      appliedAt: new Date().toISOString()
    });

    // Recompute index values
    this.recalculateIndices();

    return this.getState();
  }

  /**
   * Recalculates GCI, BRS, and updates simulated stock price metrics
   */
  recalculateIndices() {
    // 1. Calculate cumulative penalty values
    let totalPenalties = 0;
    this.activePenalties.forEach(k => {
      const rule = CYBERTOP_PREMIUM_CONFIG.penalties[k];
      if (rule) totalPenalties += rule.val;
    });

    // 2. Calculate cumulative mitigation values
    let totalMitigations = 0;
    this.activeMitigations.forEach(m => {
      const rule = CYBERTOP_PREMIUM_CONFIG.mitigations[m];
      if (rule) totalMitigations += rule.val;
    });

    // 3. Compute weighted sum of 12 dimensions
    let weightedSum = 0;
    for (const key of Object.keys(this.dimensionScores)) {
      weightedSum += (this.weights[key] || 0) * this.dimensionScores[key];
    }

    // GCI = clip(weightedSum + Penalties - Mitigations, 0, 100)
    this.gci = Math.max(0, Math.min(100, weightedSum + totalPenalties - totalMitigations));

    // BRS = 5 - GCI / 20
    this.brs = Math.max(0, Math.min(5, 5 - this.gci / 20));

    // 4. Update Stock Price
    // Price drops by 0.065% for each GCI point, +1.5% for each critical penalty, -0.8% for each mitigation
    const gciDrop = this.gci * 0.065;
    const penaltyDrop = this.activePenalties.size * 1.5;
    const mitigationRecover = this.activeMitigations.size * 0.8;
    const totalDropPercent = Math.max(0, Math.min(30, gciDrop + penaltyDrop - mitigationRecover)); // Max 30% drop
    
    const targetPrice = 100.0 * (1 - totalDropPercent / 100);
    
    // Generate transition ticks (5 ticks per transition) with random volatility
    const ticks = this.generateStockTicks(targetPrice);
    this.stockPrice = targetPrice;
    this.stockHistory.push(...ticks);
    
    // Cap stock history to keep dashboard query loading fast (e.g. max 50 items)
    if (this.stockHistory.length > 60) {
      this.stockHistory.splice(0, this.stockHistory.length - 60);
    }
  }

  /**
   * Generates linear ticks transitioning to the target price with minor market noise
   */
  generateStockTicks(targetPrice) {
    const ticks = [];
    const lastPrice = this.stockPrice;
    const steps = 5;
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      let interpolated = lastPrice + (targetPrice - lastPrice) * t;
      
      // Add random noise +/- 0.35% for points in between
      if (i < steps) {
        const noise = (Math.random() - 0.5) * 0.7; // -0.35 to +0.35
        interpolated += noise;
      }
      
      ticks.push(parseFloat(interpolated.toFixed(2)));
    }
    return ticks;
  }

  /**
   * Reverts the simulation to the previous step
   */
  undo() {
    if (this.history.length === 0) {
      console.warn("No history to undo.");
      return this.getState();
    }

    const prev = this.history.pop();
    this.currentStep = prev.currentStep;
    this.dimensionScores = prev.dimensionScores;
    this.gci = prev.gci;
    this.activePenalties = prev.activePenalties;
    this.activeMitigations = prev.activeMitigations;
    this.decisionLogs = prev.decisionLogs;
    this.redTeamLogs = prev.redTeamLogs;
    this.votes = prev.votes;
    this.dvs = prev.dvs;
    this.brs = prev.brs;
    this.stockPrice = prev.stockPrice;
    this.stockHistory = prev.stockHistory;

    return this.getState();
  }

  /**
   * Generates dynamic 30/60/90 plan recommendations based on the weakest dimensions
   */
  getPlanRecommendations() {
    // Sort dimensions by their final scores in descending order (highest score is weakest)
    const sorted = Object.keys(this.dimensionScores)
      .map(key => ({ key, score: this.dimensionScores[key] }))
      .sort((a, b) => b.score - a.score);

    const recs = { 30: [], 60: [], 90: [] };

    // Select the top 2 weakest dimensions
    const weakestKeys = sorted.slice(0, 2).map(item => item.key);

    weakestKeys.forEach(key => {
      const rec = CYBERTOP_PREMIUM_CONFIG.planRecommendations[key];
      if (rec) {
        recs[30].push({ dimension: key, text: rec[30] });
        recs[60].push({ dimension: key, text: rec[60] });
        recs[90].push({ dimension: key, text: rec[90] });
      }
    });

    // Fallback if scores are 0
    if (recs[30].length === 0) {
      const recGG = CYBERTOP_PREMIUM_CONFIG.planRecommendations['GG'];
      const recPJ = CYBERTOP_PREMIUM_CONFIG.planRecommendations['PJ'];
      recs[30].push({ dimension: 'GG', text: recGG[30] });
      recs[60].push({ dimension: 'PJ', text: recPJ[60] });
      recs[90].push({ dimension: 'GG', text: recGG[90] });
    }

    return recs;
  }
}
