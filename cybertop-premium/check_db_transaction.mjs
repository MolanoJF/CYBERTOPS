import prisma from './src/lib/prisma.js';
import { CybertopPremiumEngine } from './src/lib/engine-premium.js';

async function main() {
  const id = "ddcbe2d2-ab35-40a0-85e6-995c477d7e49";
  
  // Reconstruct state
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      decisionLogs: true,
      redTeamLogs: true,
      votes: true
    }
  });

  if (!session) {
    console.log("Session not found!");
    return;
  }

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
  
  const optionChosen = "A";
  const responseTimeSeconds = 45;

  console.log("Advancing engine...");
  engine.advanceStep(optionChosen, responseTimeSeconds);
  const state = engine.getState();

  console.log("Performing Prisma transactions...");
  try {
    const isFinished = state.currentStep >= 8;
    await prisma.$transaction([
      prisma.session.update({
        where: { id },
        data: {
          currentStep: state.currentStep,
          gci: state.gci,
          dvs: state.dvs,
          brs: state.brs,
          stockPrice: state.stockPrice,
          dimensionScoresJson: JSON.stringify(state.dimensionScores),
          stockHistoryJson: JSON.stringify(state.stockHistory),
          isFinished,
          endedAt: isFinished ? new Date() : null
        }
      }),
      prisma.decisionLog.create({
        data: {
          sessionId: id,
          step: state.currentStep,
          decisionId: state.decisionLogs[state.decisionLogs.length - 1].decisionId,
          title: state.decisionLogs[state.decisionLogs.length - 1].title,
          optionChosen: state.decisionLogs[state.decisionLogs.length - 1].optionChosen,
          optionText: state.decisionLogs[state.decisionLogs.length - 1].optionText,
          responseTimeSeconds: state.decisionLogs[state.decisionLogs.length - 1].responseTimeSeconds,
          sla: state.decisionLogs[state.decisionLogs.length - 1].sla,
          dvs: state.decisionLogs[state.decisionLogs.length - 1].dvs
        }
      })
    ]);
    console.log("Prisma transactions completed successfully!");
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
