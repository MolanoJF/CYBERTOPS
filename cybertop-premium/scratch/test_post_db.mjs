import prisma from '../src/lib/prisma.js';
import { CybertopPremiumEngine } from '../src/lib/engine-premium.js';

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

async function runTest() {
  // Let's create a new test session in DB first
  console.log("Creating a test session...");
  const session = await prisma.session.create({
    data: {
      companyName: "DB Test Corp",
      industryKey: "BANCA",
      countries: "LATAM",
      currentStep: 0,
      gci: 0,
      dvs: 100,
      brs: 5.0,
      stockPrice: 100.0,
      dimensionScoresJson: JSON.stringify({
        GG: 0, MC: 0, VD: 0, CC: 0, GI: 0, ER: 0,
        GR: 0, CG: 0, TI: 0, CR: 0, RF: 0, PJ: 0
      }),
      stockHistoryJson: JSON.stringify([100, 100, 100, 100, 100]),
      isFinished: false
    }
  });
  const id = session.id;
  console.log("Created session ID:", id);

  // Now, transition 1: from 0 to 1 (Start simulation)
  console.log("Transition 1: starting simulation (optionChosen = null)");
  let dbData = await getEngineFromDb(id);
  let { engine } = dbData;
  engine.advanceStep(null, 0);
  let state = engine.getState();

  await prisma.session.update({
    where: { id },
    data: {
      currentStep: state.currentStep,
      gci: state.gci,
      dvs: state.dvs,
      brs: state.brs,
      stockPrice: state.stockPrice,
      dimensionScoresJson: JSON.stringify(state.dimensionScores),
      stockHistoryJson: JSON.stringify(state.stockHistory),
      isFinished: state.currentStep >= 9,
      endedAt: null
    }
  });
  console.log("After Transition 1, currentStep is:", state.currentStep);

  // Now, transition 2: from 1 to 2 with option A
  console.log("Transition 2: sending decision A for Phase 1");
  dbData = await getEngineFromDb(id);
  engine = dbData.engine;
  engine.advanceStep("A", 45);
  state = engine.getState();

  console.log("Updating session in DB...");
  await prisma.session.update({
    where: { id },
    data: {
      currentStep: state.currentStep,
      gci: state.gci,
      dvs: state.dvs,
      brs: state.brs,
      stockPrice: state.stockPrice,
      dimensionScoresJson: JSON.stringify(state.dimensionScores),
      stockHistoryJson: JSON.stringify(state.stockHistory),
      isFinished: state.currentStep >= 9,
      endedAt: null
    }
  });

  const optionChosen = "A";
  if (optionChosen) {
    const lastChoice = state.decisionLogs[state.decisionLogs.length - 1];
    if (lastChoice) {
      console.log("Creating decision log in DB...");
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
  console.log("Transition 2 completed successfully! currentStep is now:", state.currentStep);
  await prisma.$disconnect();
}

runTest().catch(async (e) => {
  console.error("FATAL ERROR IN TEST:", e);
  await prisma.$disconnect();
});
