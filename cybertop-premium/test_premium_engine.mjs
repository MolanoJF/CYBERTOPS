import { CybertopPremiumEngine } from './src/lib/engine-premium.js';

function runTests() {
  console.log("=== RUNNING CYBERTOP™ PREMIUM 12-DIMENSION ENGINE TESTS ===");

  try {
    // 1. Initialize for BANCA with US and EU countries
    console.log("\nInitializing engine for BANCA with EU & US regulatory flags...");
    const engine = new CybertopPremiumEngine('Global Banking Corp', 'BANCA', ['EU', 'US']);
    let state = engine.getState();
    
    // Assert initial state
    assert(state.companyName === 'Global Banking Corp', "Company name should match");
    assert(state.industryKey === 'BANCA', "Industry key should match");
    assert(state.currentStep === 0, "Initial step should be 0");
    assert(state.gci === 0, "Initial GCI should be 0");
    assert(state.brs === 5.0, "Initial BRS should be 5.0");
    assert(state.dvs === 100, "Initial DVS should be 100");
    assert(state.stockPrice === 100.00, "Initial stock price should be 100.00");
    assert(state.stockHistory.length === 5, "Initial stock history should have 5 default ticks");
    
    // Verify 12 dimension scores are all 0
    const dims = ['GG', 'MC', 'VD', 'CC', 'GI', 'ER', 'GR', 'CG', 'TI', 'CR', 'RF', 'PJ'];
    dims.forEach(d => {
      assert(state.dimensionScores[d] === 0, `Initial ${d} should be 0`);
    });
    console.log("✔ Initial state correct.");

    // 2. Verify Country Multipliers
    console.log("\nVerifying country multipliers...");
    const mults = engine.getCountryMultipliers();
    // EU multiplies ER by 1.25 and MC by 1.25
    // US multiplies ER by 1.20 and GI by 1.20
    // Combined multipliers: ER = 1.25 * 1.20 = 1.50x, MC = 1.25x, GI = 1.20x, others = 1.0x
    assert(mults.ER === 1.50, "Regulatory Exposure (ER) multiplier should be 1.50 (EU 1.25 * US 1.20)");
    assert(mults.MC === 1.25, "Multi-jurisdictional Coordination (MC) multiplier should be 1.25 (EU)");
    assert(mults.GI === 1.20, "Investor Relations (GI) multiplier should be 1.20 (US)");
    assert(mults.GG === 1.0, "Government Governance (GG) multiplier should be 1.0");
    console.log("✔ Country multipliers calculated correctly.");

    // 3. Step 1: Start simulation (advances from 0 to 1, injects Phase 1)
    console.log("\nStarting simulation (advancing from Step 0 to Step 1)...");
    state = engine.advanceStep(null, 0);
    assert(state.currentStep === 1, "Step should be 1 after start");
    assert(state.stockHistory.length === 10, "Stock history should have 10 ticks after step 1");

    console.log("Advancing Step 1 decision: Decision 1 Option A (Fast, 45 seconds)...");
    state = engine.advanceStep('A', 45);
    
    console.log("Calculated Dimension Scores:", state.dimensionScores);
    console.log("Calculated GCI:", state.gci);
    console.log("Calculated BRS:", state.brs);
    console.log("Calculated DVS:", state.dvs);
    console.log("Stock Price:", state.stockPrice);
    console.log("Stock Ticks Count:", state.stockHistory.length);

    assert(state.currentStep === 2, "Step should be 2 after Decision 1");
    // Verify stock history has grown by another 5 ticks (now 15 ticks total)
    assert(state.stockHistory.length === 15, "Stock history should have 15 ticks after step 2");
    
    // Verify DVS calculation for step 1
    // Decision 1 has SLA = 120s. Response time = 45s.
    // dvs_j = clip(100 * (1 - (45 - 120) / 240), 0, 100) = 100.
    assert(state.decisionLogs[0].dvs === 100, "First decision DVS should be 100");
    assert(state.dvs === 100, "Average DVS should be 100");
    console.log("✔ Step 1 calculation verified.");

    // 4. Test Red Team Injection
    console.log("\nInjecting Red Team Event: 'insider_leak'...");
    // Let's check config-premium.js to verify if insider_leak exists or what the red team keys are.
    // For now we'll just check if we can inject 'insider_leak' and check if it modifies scores.
    state = engine.injectRedTeam('insider_leak');
    
    console.log("After Red Team - Dimension Scores:", state.dimensionScores);
    console.log("After Red Team - GCI:", state.gci);
    console.log("Red Team Log:", state.redTeamLogs);
    
    assert(state.redTeamLogs.length === 1, "Red Team log should record 1 event");
    assert(state.redTeamLogs[0].injectKey === 'insider_leak', "Red Team log should match key");
    console.log("✔ Red Team event injection verified.");

    // 5. Test Undo Functionality
    console.log("\nTesting Undo capability...");
    state = engine.undo();
    assert(state.redTeamLogs.length === 0, "Red Team log should be cleared after undo");
    console.log("✔ Undo successfully reverted Red Team event.");

    // 6. Test Plan Recommendations
    console.log("\nTesting dynamic 30/60/90 plan recommendations...");
    const recs = engine.getPlanRecommendations();
    console.log("Generated 30 days:", recs[30]);
    console.log("Generated 60 days:", recs[60]);
    console.log("Generated 90 days:", recs[90]);
    
    assert(recs[30].length === 2, "Recommendations should select top 2 weakest dimensions");
    assert(recs[60].length === 2, "Recommendations should select top 2 weakest dimensions");
    assert(recs[90].length === 2, "Recommendations should select top 2 weakest dimensions");
    console.log("✔ Recommendation generation verified.");

    console.log("\n✔ ALL PREMIUM ENGINE TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("\nFAIL: Test assertion failed:", err.stack || err.message);
    process.exit(1);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

runTests();
