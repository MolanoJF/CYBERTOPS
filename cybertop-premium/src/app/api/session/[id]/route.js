import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CybertopPremiumEngine } from '@/lib/engine-premium';
import { saveSessionToBenchmark, getIndustryPercentile } from '@/lib/benchmark';
import { CYBERTOP_PREMIUM_CONFIG } from '@/lib/config-premium';

// Helper to rebuild engine instance from database state
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

  // Reconstruct list of active penalties & mitigations based on choices logged in DB
  const activePenalties = [];
  const activeMitigations = [];
  
  session.decisionLogs.forEach(log => {
    const dec = CYBERTOP_PREMIUM_CONFIG.decisions.find(d => d.id === log.decisionId);
    if (dec) {
      const opt = dec.options.find(o => o.key === log.optionChosen);
      if (opt) {
        if (opt.penalties) {
          opt.penalties.forEach(p => {
            if (!activePenalties.some(ap => ap.key === p)) {
              activePenalties.push({ key: p, ...CYBERTOP_PREMIUM_CONFIG.penalties[p] });
            }
          });
        }
        if (opt.mitigations) {
          opt.mitigations.forEach(m => {
            if (!activeMitigations.some(am => am.key === m)) {
              activeMitigations.push({ key: m, ...CYBERTOP_PREMIUM_CONFIG.mitigations[m] });
            }
          });
        }
      }
    }
  });

  // Map database session back to engine state format
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
    activePenalties: activePenalties,
    activeMitigations: activeMitigations,
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

  // Re-populate votes matrix from DB
  for (let step = 1; step <= 8; step++) {
    mappedState.votes[step] = { A: 0, B: 0, C: 0 };
  }
  session.votes.forEach(v => {
    if (mappedState.votes[v.step] && ['A', 'B', 'C'].includes(v.option)) {
      mappedState.votes[v.step][v.option]++;
    }
  });

  // Re-instantiate engine
  const engine = CybertopPremiumEngine.fromState(mappedState);
  return { engine, session };
}

// 1. GET: Fetch current session state
export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = rawId.toLowerCase();
    const dbData = await getEngineFromDb(id);

    if (!dbData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { engine, session } = dbData;
    const state = engine.getState();

    // Calculate percentile if game is finished
    let percentile = null;
    if (state.isFinished) {
      percentile = await getIndustryPercentile(state.industryKey, state.gci);
    }

    return NextResponse.json({
      id: session.id,
      ...state,
      showQuestion: session.showQuestion,
      percentile
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching session state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. POST: Advance the simulation step (Log option choice & recalculate scores)
export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = rawId.toLowerCase();
    const dbData = await getEngineFromDb(id);

    if (!dbData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { engine, session } = dbData;
    const body = await request.json();
    const { optionChosen, responseTimeSeconds, action } = body;

    // If the action is to just reveal the question to the board
    if (action === 'showQuestion') {
      await prisma.session.update({
        where: { id },
        data: { showQuestion: true }
      });
      const state = engine.getState();
      return NextResponse.json({
        id: session.id,
        ...state,
        showQuestion: true
      }, { status: 200 });
    }

    // Advance engine state
    engine.advanceStep(optionChosen, responseTimeSeconds);
    const state = engine.getState();

    // Update session and create decision log atomically inside a Prisma transaction
    const isFinished = state.currentStep >= 9;
    const operations = [];

    operations.push(
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
          showQuestion: false,
          endedAt: isFinished ? new Date() : null
        }
      })
    );

    if (optionChosen) {
      const lastChoice = state.decisionLogs[state.decisionLogs.length - 1];
      if (lastChoice) {
        operations.push(
          prisma.decisionLog.create({
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
          })
        );
      }
    }

    await prisma.$transaction(operations);

    // Save to Benchmark table if the wargame just finished
    if (isFinished && !session.isFinished) {
      await saveSessionToBenchmark(state);
    }

    return NextResponse.json({
      id: session.id,
      ...state,
      showQuestion: false
    }, { status: 200 });
  } catch (error) {
    console.error('Error advancing session step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. PATCH: Facilitator triggers a Red Team injection
export async function PATCH(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = rawId.toLowerCase();
    const dbData = await getEngineFromDb(id);

    if (!dbData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { engine, session } = dbData;
    const body = await request.json();
    const { injectKey } = body;

    if (!injectKey) {
      return NextResponse.json({ error: 'Missing injectKey in request body.' }, { status: 400 });
    }

    // Apply injection to engine
    engine.injectRedTeam(injectKey);
    const state = engine.getState();

    // Update session table in SQLite
    await prisma.session.update({
      where: { id },
      data: {
        gci: state.gci,
        brs: state.brs,
        stockPrice: state.stockPrice,
        dimensionScoresJson: JSON.stringify(state.dimensionScores),
        stockHistoryJson: JSON.stringify(state.stockHistory)
      }
    });

    // Create database log for Red Team injection
    const lastRedTeam = state.redTeamLogs[state.redTeamLogs.length - 1];
    if (lastRedTeam) {
      await prisma.redTeamLog.create({
        data: {
          sessionId: id,
          step: state.currentStep,
          injectKey: lastRedTeam.injectKey,
          name: lastRedTeam.name
        }
      });
    }

    return NextResponse.json({
      id: session.id,
      ...state
    }, { status: 200 });
  } catch (error) {
    console.error('Error injecting Red Team event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
