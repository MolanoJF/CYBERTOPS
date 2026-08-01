import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CybertopPremiumEngine } from '@/lib/engine-premium';

export async function POST(request) {
  try {
    const body = await request.json();
    const { companyName, industryKey, countries } = body;

    if (!companyName || !industryKey || !countries || !Array.isArray(countries)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters. Requires: companyName, industryKey, countries (array).' },
        { status: 400 }
      );
    }

    // Initialize engine
    const engine = new CybertopPremiumEngine(companyName, industryKey, countries);
    const state = engine.getState();

    // Create session in SQLite database
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

    return NextResponse.json({
      sessionId: session.id,
      ...state
    }, { status: 201 });
  } catch (error) {
    console.error('Error starting session API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
