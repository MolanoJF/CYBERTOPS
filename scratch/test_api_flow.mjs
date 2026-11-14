import prisma from '../src/lib/prisma.js';
import { CybertopPremiumEngine } from '../src/lib/engine-premium.js';
import { saveSessionToBenchmark } from '../src/lib/benchmark.js';

async function getEngineFromDb(id) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      decisionLogs: true,
      redTeamLogs: true,
      votes: true
    }
  });

  if (!session) return null;

  const activePenalties = [];
  const activeMitigations = [];
  
  session.decisionLogs.forEach(log => {
    // We import CYBERTOP_PREMIUM_CONFIG from config-premium
  });

  // Simplified reconstruct
  const mappedState = {
    companyName: session.companyName,
    industryKey: session.industryKey,
    countries: session.countries.split(','),
    currentStep: session.currentStep,
    dimensionScores: JSON.parse(session.dimensionScoresJson),
    gci: session.gci,
    dvs: session.dvs,
    brs: session.brs,
    stockPrice: session.stockPrice,
    stockHistory: JSON.parse(session.stockHistoryJson),
    activePenalties: [],
    activeMitigations: [],
    decisionLogs: session.decisionLogs.map(d => ({
      decisionId: d.decisionId,
      title: d.title,
      optionChosen: d.optionChosen,
      optionText: d.optionText,
      responseTimeSeconds: d.responseTimeSeconds,
      sla: d.sla,
      dvs: d.dvs
    })),
    redTeamLogs: session.redTeamLogs.map(r => ({
      injectKey: r.injectKey,
      name: r.name,
      step: r.step,
      appliedAt: r.appliedAt.toISOString()
    })),
    votes: {},
    isFinished: session.isFinished
  };

  for (let step = 1; step <= 8; step++) {
    mappedState.votes[step] = { A: 0, B: 0, C: 0 };
  }
  session.votes.forEach(v => {
    if (mappedState.votes[v.step] && ['A', 'B', 'C'].includes(v.option)) {
      mappedState.votes[v.step][v.option]++;
    }
  });

  const engine = CybertopPremiumEngine.fromState(mappedState);
  return { engine, session };
}

async function simulateApiFlow() {
  console.log("=== SIMULATING API FLOW IN DB ===");
  
  // 1. Create a session
  console.log("Creating new session...");
  const companyName = "Test Flow Corp";
  const industryKey = "BANCA";
  const countries = ["LATAM"];
  
  const engine = new CybertopPremiumEngine(companyName, industryKey, countries);
  const state = engine.getState();

  const session = await prisma.session.create({
    data: {
      companyName,
      industryKey,
      countries: countries.join(','),
      currentStep: 0,
      gci: 0,
      dvs: 100,
      brs: 5.0,
      stockPrice: 100.0,
      dimensionScoresJson: JSON.stringify(state.dimensionScores),
      stockHistoryJson: JSON.stringify(state.stockHistory),
      isFinished: false
    }
  });
  const id = session.id;
  console.log(`Created session ID: ${id}`);

  // 2. First POST: Advance from 0 to 1 (optionChosen = null)
  console.log("\n--- POST 1: Advancing from 0 to 1 (optionChosen = null) ---");
  {
    const dbData = await getEngineFromDb(id);
    const { engine: eng, session: sess } = dbData;
    eng.advanceStep(null, 0);
    const state1 = eng.getState();
    
    await prisma.session.update({
      where: { id },
      data: {
        currentStep: state1.currentStep,
        gci: state1.gci,
        dvs: state1.dvs,
        brs: state1.brs,
        stockPrice: state1.stockPrice,
        dimensionScoresJson: JSON.stringify(state1.dimensionScores),
        stockHistoryJson: JSON.stringify(state1.stockHistory),
        isFinished: state1.currentStep >= 9
      }
    });
    console.log(`Updated session currentStep to: ${state1.currentStep}`);
  }

  // 3. Second POST: Advance from 1 to 2 (optionChosen = "A")
  console.log("\n--- POST 2: Advancing from 1 to 2 (optionChosen = 'A') ---");
  {
    const dbData = await getEngineFromDb(id);
    const { engine: eng, session: sess } = dbData;
    console.log(`Loaded session currentStep from DB: ${sess.currentStep}`);
    
    eng.advanceStep("A", 45);
    const state2 = eng.getState();
    console.log(`Engine advanced to currentStep: ${state2.currentStep}`);
    console.log(`Engine decision logs count: ${state2.decisionLogs.length}`);
    
    await prisma.session.update({
      where: { id },
      data: {
        currentStep: state2.currentStep,
        gci: state2.gci,
        dvs: state2.dvs,
        brs: state2.brs,
        stockPrice: state2.stockPrice,
        dimensionScoresJson: JSON.stringify(state2.dimensionScores),
        stockHistoryJson: JSON.stringify(state2.stockHistory),
        isFinished: state2.currentStep >= 9
      }
    });

    const lastChoice = state2.decisionLogs[state2.decisionLogs.length - 1];
    if (lastChoice) {
      console.log(`Writing DecisionLog to DB: step = ${lastChoice.decisionId}, option = ${lastChoice.optionChosen}`);
      await prisma.decisionLog.create({
        data: {
          sessionId: id,
          step: lastChoice.decisionId,
          decisionId: lastChoice.decisionId,
          title: lastChoice.title,
          optionChosen: lastChoice.optionChosen,
          optionText: lastChoice.optionText,
          responseTimeSeconds: lastChoice.responseTimeSeconds,
          sla: lastChoice.sla,
          dvs: lastChoice.dvs
        }
      });
    }
  }

  // 4. Verify DB state
  const finalSession = await prisma.session.findUnique({
    where: { id },
    include: { decisionLogs: true }
  });
  console.log("\n=== FINAL DB STATE ===");
  console.log(`currentStep: ${finalSession.currentStep}`);
  console.log(`decisionLogs count: ${finalSession.decisionLogs.length}`);
  if (finalSession.decisionLogs.length > 0) {
    console.log(`Logged Decision ID: ${finalSession.decisionLogs[0].decisionId}`);
  }

  // Cleanup
  await prisma.session.delete({ where: { id } });
  console.log("Cleanup completed.");
}

simulateApiFlow().catch(console.error).finally(() => prisma.$disconnect());
