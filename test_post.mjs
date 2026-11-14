import prisma from './src/lib/prisma.js';
import { CybertopPremiumEngine } from './src/lib/engine-premium.js';

// Helper to rebuild engine instance from database state (copied from route.js)
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

async function testPost() {
  const id = "ddcbe2d2-ab35-40a0-85e6-995c477d7e49";
  const dbData = await getEngineFromDb(id);
  if (!dbData) {
    console.log("Session not found");
    return;
  }
  const { engine, session } = dbData;
  const optionChosen = "A";
  const responseTimeSeconds = 45;

  console.log("Advancing step...");
  try {
    engine.advanceStep(optionChosen, responseTimeSeconds);
    const state = engine.getState();
    console.log("Engine advanced successfully.");
    console.log("New step:", state.currentStep);
    console.log("Decision logs length:", state.decisionLogs.length);
    console.log("Last choice:", state.decisionLogs[state.decisionLogs.length - 1]);

    if (optionChosen) {
      const lastChoice = state.decisionLogs[state.decisionLogs.length - 1];
      if (lastChoice) {
        console.log("Writing decision log to DB...");
        // Validate payload before writing
        console.log({
          sessionId: id,
          step: state.currentStep,
          decisionId: lastChoice.decisionId,
          title: lastChoice.title,
          optionChosen: lastChoice.optionChosen,
          optionText: lastChoice.optionText,
          responseTimeSeconds: lastChoice.responseTimeSeconds,
          sla: lastChoice.sla,
          dvs: lastChoice.dvs
        });
      } else {
        console.log("No last choice found!");
      }
    }
  } catch (err) {
    console.error("CRASH:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testPost();
